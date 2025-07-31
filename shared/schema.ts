import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id).notNull(),
  content: text("content").notNull(),
  isUser: text("is_user").notNull(), // 'true' or 'false' as text
  metadata: jsonb("metadata"), // For storing travel results, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const travelSearches = pgTable("travel_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id).notNull(),
  searchType: text("search_type").notNull(), // 'hotels', 'flights', 'activities'
  query: jsonb("query").notNull(),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  userId: true,
  title: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  content: true,
  isUser: true,
  metadata: true,
});

export const insertTravelSearchSchema = createInsertSchema(travelSearches).pick({
  sessionId: true,
  searchType: true,
  query: true,
  results: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type TravelSearch = typeof travelSearches.$inferSelect;
export type InsertTravelSearch = z.infer<typeof insertTravelSearchSchema>;

// Extended types for frontend
export type MessageWithMetadata = Message & {
  travelResults?: {
    type: 'hotels' | 'flights' | 'activities';
    data: any[];
  };
};

export type ChatSessionWithMessages = ChatSession & {
  messages: MessageWithMetadata[];
  messageCount: number;
};
