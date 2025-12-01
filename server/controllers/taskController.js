import { tasks } from "../src/db/schema"; // path to your users table
import { comments } from "../src/db/schema"; // path to your users table
import { db } from "../src/db/db"; // your Drizzle db instance
import { eq } from 'drizzle-orm';

// GET ALL TASKS
const getTasks = async (req, res) => {
  try {
    const user_id = req.user?.id; // from auth middleware
    const allTasks = await db.select().from(tasks).where(eq(tasks.user_id, user_id));
    res.json(allTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch tasks" });
  }
};

// ADD NEW TASK
const addTask = async (req, res) => {
  try {
    const { taskName, projectName, status, due_date } = req.body;
    const user_id = req.user?.id; // from auth middleware

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
    const { id } = req.params; // get task id from URL

    // FIX: Use the 'eq' operator for comparison
    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, id)) // Correct: eq(Column, Value)
      .returning(); // returning deleted row(s)

    if (deletedTask.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully", task: deletedTask[0] });
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
