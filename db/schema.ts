import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  // id: integer("id").notNull().primaryKey({ autoIncrement: true }),
  id: text("id").notNull().primaryKey(),
  username: text("username").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  notifications_count: integer("notifications_count").notNull().default(0),
  emailAddress: text("emailAddress").notNull().unique(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const urlTable = pgTable("url", {
  // id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  url: text("url").notNull().unique().primaryKey(),
  listingUrls: text("listingUrls").notNull(),
  lastScraped: timestamp("lastScraped", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  processed: boolean("processed").default(true),
  lastDifference: timestamp("lastDifference", {
    withTimezone: true,
    mode: "date",
  }),
  paused: boolean("paused").default(false),
  errorMessage: text("errorMessage"),
});

export const webhookEvents = pgTable("webhookEvent", {
  id: integer("id").primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  eventName: text("eventName").notNull(),
  processed: boolean("processed").default(false),
  body: jsonb("body").notNull(),
  processingError: text("processingError"),
});

export type SelectUrl = typeof urlTable.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
