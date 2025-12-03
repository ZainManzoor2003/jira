import { projects, tasks, users } from "../src/db/schema"; // path to your users table
import { comments } from "../src/db/schema"; // path to your users table
import { db } from "../src/db/db"; // your Drizzle db instance
import { and, eq, inArray, or, sql } from 'drizzle-orm';

// GET ALL TASKS
const getTasks = async (req, res) => {
  // await db.delete(tasks);
  // await db.delete(projects);
  try {

    const { projectName } = req.params;
    const user_id = req.user?.id; // from auth middleware

    const project = await db.select().from(projects).where(eq(projects.projectName, projectName));
    if (project.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    const user = await db.select().from(users).where(eq(users.id, user_id));
    const userEmail = user[0].email;

    const allTasks = await db.select().from(projects).where(

      or(
        // Condition 1: User owns the task
        and(
          eq(projects.owner_id, user_id),
          eq(projects.projectName, projectName)
        ),

        // Condition 2: User is a member of the project
        and(
          sql`${userEmail} = ANY(${projects.members_email})`,
          eq(projects.projectName, projectName)
        )
      )
    )

    const taskIds = allTasks[0].tasks_ids;

    // console.log('taskIds',taskIds)

    const projectTasks = await db
      .select()
      .from(tasks)
      .where(inArray(tasks.id, taskIds));
    // console.log('projectTasks',projectTasks)

    const canModify = project[0].owner_id === user_id;

    res.json({ allTasks: projectTasks, canModify });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch tasks" });
  }
};

// ADD NEW TASK
const addTask = async (req, res) => {
  try {
    const { taskName, projectName, status, due_date } = req.body;
    const user_id = req.user?.id;

    // 1. Check if project exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectName, projectName),
          eq(projects.owner_id, user_id)
        )
      )

    if (existingProject.length === 0) {
      return res.status(409).json({
        message: "Project does not exist. Please create the project first."
      });
    }

    // 2. Insert task
    const newTask = await db
      .insert(tasks)
      .values({
        taskName,
        projectName,
        status: status || "to-do",
        due_date,
        user_id
      })
      .returning();

    // console.log('new task', newTask)

    const updatedProject = await db
      .update(projects)
      .set({
        tasks_ids: sql`${projects.tasks_ids} || ARRAY[${newTask[0].id}]::uuid[]`,
      })
      .where(eq(projects.id, existingProject[0].id))
      .returning();

    res.json(newTask[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to add task" });
  }
};

// UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskName, projectName, due_date } = req.body;

    const updated = await db
      .update(tasks)
      .set({
        taskName,
        projectName,
        due_date,
      })
      .where(eq(tasks.id, id))
      .returning();

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to update task" });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await db
      .update(tasks)
      .set({
        status
      })
      .where(eq(tasks.id, id))
      .returning();

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to update task" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id, projectName } = req.params;
    const user_id = req.user?.id;

    // 1. Find the project where this task belongs
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectName, projectName),
          eq(projects.owner_id, user_id)
        )
      );

    if (project.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 2. Delete the task
    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();

    if (deletedTask.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    // 3. Remove the task id from project's tasks_ids array (Postgres array remove)
    await db
      .update(projects)
      .set({
        tasks_ids: sql`array_remove(${projects.tasks_ids}, ${id})`
      })
      .where(eq(projects.id, project[0].id));

    res.json({
      message: "Task deleted successfully",
      task: deletedTask[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to delete task" });
  }
};

const commentTask = async (req, res) => {
  try {
    const { taskId } = req.params; // from URL
    const { comment } = req.body;
    const userId = req.user?.id; // from auth middleware

    // console.log(taskId,comment,userId)

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // insert into comments table
    const result = await db.insert(comments).values({
      task_id: taskId,
      user_id: userId,
      comment,
    }).returning();

    return res.status(201).json({
      message: "Comment added successfully",
      comment: result[0],
    });
  } catch (error) {
    console.error("Error commenting on task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getComments = async (req, res) => {
  // await db.delete(comments);
  try {
    const allComments = await db.select().from(comments);
    res.json(allComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch comments" });
  }
};

const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id // from auth middleware

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const taskComments = await db
      .select()
      .from(comments)
      .where(
        eq(comments.task_id, taskId),
        eq(comments.user_id, userId)
      );

    res.json(taskComments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Unable to fetch comments" });
  }
};



module.exports = {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  commentTask,
  getComments,
  getCommentsByTask
};
