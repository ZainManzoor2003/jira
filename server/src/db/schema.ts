import { pgTable, varchar, integer, uuid, timestamp,boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 100 }),
    otp: varchar("otp", { length: 6 }),
    created_at: timestamp("created_at").defaultNow(),
    otp_expiry_date: timestamp("otp_expiry_date"),
    isVerified: boolean("is_verified").default(false).notNull(),
});
