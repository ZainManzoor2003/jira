import { db } from "./db/db";
import { users } from "./db/schema";

async function main() {
  // Insert a new user
  await db.insert(users).values({ name: "Zain", age: 24 });

  // Fetch all users
  const allUsers = await db.select().from(users);
  console.log(allUsers);
}

main().catch(console.error);
