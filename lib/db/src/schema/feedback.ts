import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const feedbackTable = pgTable("feedback", {
  id: serial("id").primaryKey(),
  rating: text("rating").notNull(),
  comment: text("comment"),
  favHook: text("fav_hook"),
  topic: text("topic"),
  platform: text("platform"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedbackTable)
  .omit({ id: true, createdAt: true })
  .extend({
    rating: z.enum(["yes", "a_little", "no"]),
    comment: z.string().max(1000).optional(),
    favHook: z.string().max(500).optional(),
    topic: z.string().max(500).optional(),
    platform: z.string().max(100).optional(),
  });

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbackTable.$inferSelect;
