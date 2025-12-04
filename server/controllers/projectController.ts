import { db } from "../src/db/db"; // your Drizzle db instance
import { and, eq, or, sql } from 'drizzle-orm';
import { projects, tasks, users, comments } from "../src/db/schema";
import { Request, Response } from "express";

interface AuthenticatedRequest<Body = any> extends Request {
  user?: {
    id: string;
    email?: string;
  };
  body: Body;
}

interface AddProjectBody {
  projectName: string;
}
interface UpdateProjectParams {
  id: string;
}

// Body interface
interface UpdateProjectBody {
  projectName: string;
}
interface DeleteProjectParams {
  id: string;
}
// ➤ CREATE PROJECT
const addProject = async (
  req: AuthenticatedRequest<AddProjectBody>,
  res: Response
) => {
  try {
    const user_id = req.user?.id;
    const { projectName } = req.body;

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

    // Fetch owner's email
    const user = await db.select().from(users).where(eq(users.id, user_id));
    const owner_email = user[0]?.email;
    if (!owner_email) {
      return res.status(404).json({ message: "User not found" });
    }

    // Insert new project
    const result = await db
      .insert(projects)
      .values({ projectName, owner_id: user_id, owner: true, owner_email })
      .returning();

    return res.status(201).json({ message: "Project created", data: result });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ➤ UPDATE PROJECT (BY ID)
const updateProject = async (
  req: Request<UpdateProjectParams, {}, UpdateProjectBody>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { projectName } = req.body;

    if (!projectName) {
      return res.status(400).json({ message: "Project name required" });
    }

    const result = await db
      .update(projects)
      .set({ projectName })
      .where(eq(projects.id, id))
      .returning();

    return res.status(200).json({ message: "Project updated", data: result });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ➤ DELETE PROJECT (BY ID)
const deleteProject = async (
  req: Request<DeleteProjectParams>,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Delete the project
    await db.delete(projects).where(eq(projects.id, id));

    return res.status(200).json({ message: "Project deleted" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getProjectsByUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user email
    const userData = await db.select().from(users).where(eq(users.id, user_id));
    const userEmail = userData[0]?.email;

    if (!userEmail) {
      return res.status(404).json({ message: "User not found" });
    }

    // Projects owned by the user
    const myProjects = await db.select().from(projects)
      .where(eq(projects.owner_id, user_id));

    // Projects where the user is a member
    const assignedProjects = await db.select().from(projects)
      .where(sql`${userEmail} = ANY(${projects.members_email})`);

    res.status(200).json({ myProjects, assignedProjects });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch projects", details: err.message });
  }
};

module.exports = {
  addProject,
  updateProject,
  deleteProject,
  getProjectsByUser
};
