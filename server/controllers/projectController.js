import { db } from "../src/db/db"; // your Drizzle db instance
import { and, eq, or, sql } from 'drizzle-orm';
import { projects, tasks, users, comments } from "../src/db/schema";

// ➤ CREATE PROJECT
const addProject = async (req, res) => {
  try {
    const user_id = req.user?.id; // from auth middleware
    let { projectName } = req.body;

    if (!user_id || !projectName) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    // Check if project with same name exists for this user
    const existing = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.owner_id, user_id),
          eq(projects.projectName, projectName)
        )
      );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Project with this name already exists" });
    }

    const user = await db.select().from(users).where(eq(users.id, user_id));
    const owner_email = user[0].email;

    // Insert new project
    const result = await db
      .insert(projects)
      .values({ projectName, owner_id: user_id, owner: true, owner_email: owner_email })
      .returning();

    return res.status(201).json({ message: "Project created", data: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ UPDATE PROJECT (BY ID)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName } = req.body;

    console.log(projectName)

    if (!projectName) {
      return res.status(400).json({ message: "Project name required" });
    }

    const result = await db.update(projects)
      .set({ projectName })
      .where(eq(projects.id, id))
      .returning();

    return res.status(200).json({ message: "Project updated", data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ DELETE PROJECT (BY ID)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params; // if using /delete?id=xxxxx

    await db.delete(projects)
      .where(eq(projects.id, id));

    return res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProjectsByUser = async (req, res) => {
  try {
    const user_id = req.user?.id; // from auth middleware
    const userData = await db.select().from(users).where(eq(users.id, user_id));
    const userEmail = userData[0].email;

    const myProjects = await db.select().from(projects)
      .where(
        eq(projects.owner_id, user_id),
      );

    const assignedProjects = await db.select().from(projects)
      .where(
        sql`${userEmail} = ANY(${projects.members_email})`
      )
    // console.log(myProjects, assignedProjects)
    res.json({ myProjects: myProjects, assignedProjects: assignedProjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch projects" });
  }
}

module.exports = {
  addProject,
  updateProject,
  deleteProject,
  getProjectsByUser
};
