import { pgTable, text, varchar, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gardens = pgTable("gardens", {
  code: varchar("code", { length: 6 }).primaryKey(),
  name: text("name").notNull(),
  healthScore: integer("health_score").notNull().default(100),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  gardenCode: varchar("garden_code", { length: 6 }).notNull(),
  name: varchar("name", { length: 20 }).notNull(),
  avatarId: varchar("avatar_id", { length: 20 }).notNull(), // 'bunny', 'fox', 'cat', 'bear'
  color: varchar("color", { length: 20 }).notNull().default('blush'), 
  role: varchar("role", { length: 10 }).notNull(), // 'owner', 'friend'
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const flowers = pgTable("flowers", {
  id: serial("id").primaryKey(),
  gardenCode: varchar("garden_code", { length: 6 }).notNull(),
  drawnBy: integer("drawn_by").notNull(),
  imageUrl: text("image_url").notNull(), // base64 string
  x: integer("x").default(50), // % of garden width
  y: integer("y").default(50), // % of garden height
  scale: decimal("scale").default('1.0'),
  rotation: integer("rotation").default(0),
  inGarden: boolean("in_garden").default(false),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
});

export const letters = pgTable("letters", {
  id: serial("id").primaryKey(),
  gardenCode: varchar("garden_code", { length: 6 }).notNull(),
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id"), 
  body: text("body").notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull().default('💌'),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});

// Relations
export const gardensRelations = relations(gardens, ({ many }) => ({
  users: many(users),
  flowers: many(flowers),
  letters: many(letters),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  garden: one(gardens, {
    fields: [users.gardenCode],
    references: [gardens.code],
  }),
  flowers: many(flowers),
  sentLetters: many(letters, { relationName: 'sentLetters' }),
  receivedLetters: many(letters, { relationName: 'receivedLetters' }),
}));

// Schemas
export const insertGardenSchema = createInsertSchema(gardens).omit({ healthScore: true, lastActivity: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, joinedAt: true });
export const insertFlowerSchema = createInsertSchema(flowers).omit({ id: true, savedAt: true });
export const insertLetterSchema = createInsertSchema(letters).omit({ id: true, sentAt: true, readAt: true });

// Types
export type Garden = typeof gardens.$inferSelect;
export type User = typeof users.$inferSelect;
export type Flower = typeof flowers.$inferSelect;
export type Letter = typeof letters.$inferSelect;

export type CreateGardenRequest = z.infer<typeof insertGardenSchema>;
export type CreateUserRequest = z.infer<typeof insertUserSchema>;
export type CreateFlowerRequest = z.infer<typeof insertFlowerSchema>;
export type UpdateFlowerRequest = Partial<CreateFlowerRequest>;
export type CreateLetterRequest = z.infer<typeof insertLetterSchema>;

export type GardenStateResponse = {
  garden: Garden;
  users: User[];
  flowers: Flower[];
  letters: Letter[];
};
