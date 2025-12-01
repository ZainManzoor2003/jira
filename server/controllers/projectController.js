import { db } from "../src/db/db"; // your Drizzle db instance
import { and,eq } from 'drizzle-orm';
import { projects } from "../src/db/schema";

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
          eq(projects.user_id, user_id),
          eq(projects.projectName, projectName)
        )
      );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Project with this name already exists" });
    }

    // Insert new project
    const result = await db
      .insert(projects)
      .values({ user_id, projectName })
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
        const allProjects = await db.select().from(projects).where(eq(projects.user_id, user_id));
        res.json(allProjects);
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
