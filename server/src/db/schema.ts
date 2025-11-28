import { pgTable, varchar, integer, uuid, timestamp, boolean } from "drizzle-orm/pg-core";

const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 100 }),
    otp: varchar("otp", { length: 6 }),
    created_at: timestamp("created_at").defaultNow(),
    otp_expiry_date: timestamp("otp_expiry_date"),
    isVerified: boolean("is_verified").default(false).notNull(),
});

const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    taskName: varchar("task_name", { length: 255 }).notNull(),
    projectName: varchar("project_name", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("to-do"), 
    created_at: timestamp("created_at").defaultNow(),
    due_date: varchar("due_date", { length: 20 }).notNull(),
});

const comments = pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    task_id: uuid("task_id").notNull(),
    user_id: uuid("user_id").notNull(),
    comment: varchar("comment", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
})

module.exports = {
    users,
    tasks,
    comments
};