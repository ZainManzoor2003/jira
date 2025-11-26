import { tasks } from "../src/db/schema"; // path to your users table
import { db } from "../src/db/db"; // your Drizzle db instance
import { eq } from 'drizzle-orm';

// GET ALL TASKS
const getTasks = async (req, res) => {
  try {
    const allTasks = await db.select().from(tasks);
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

    const newTask = await db
      .insert(tasks)
      .values({
        taskName,
        projectName,
        status: status || "to-do",
        due_date,
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
    const { status} = req.body;

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

module.exports = {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus
};
