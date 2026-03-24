import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clicksTable = pgTable("clicks", {
  id: serial("id").primaryKey(),
  hookText: text("hook_text").notNull(),
  buttonClicked: text("button_clicked").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertClickSchema = createInsertSchema(clicksTable)
  .omit({ id: true })
  .extend({
    hookText: z.string().max(1000),
    buttonClicked: z.string().max(200),
    timestamp: z.string().optional(),
  });

export type InsertClick = z.infer<typeof insertClickSchema>;
export type Click = typeof clicksTable.$inferSelect;
