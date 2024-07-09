import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const signUpsTable = sqliteTable("signups", {
  id: integer("id").primaryKey(),
  email: text("email").unique().notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updateAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date()
  ),
});

export type InsertSignUp = typeof signUpsTable.$inferInsert;
export type SelectSignUp = typeof signUpsTable.$inferSelect;
