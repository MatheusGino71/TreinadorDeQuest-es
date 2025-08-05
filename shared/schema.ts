import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: varchar("role", { length: 20 }).default("user"), // "user" ou "admin"
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  options: text("options").array().notNull(), // Array of 4 options
  correctAnswerIndex: integer("correct_answer_index").notNull(), // 0-3
  difficulty: integer("difficulty").notNull().default(1), // 1-5 stars
  category: text("category").notNull().default("Processo Civil"),
  challengeType: text("challenge_type").notNull().default("OAB_1_FASE"), // "OAB_1_FASE" or "CONCURSOS_MPSP"
  explanation: text("explanation"),
});

export const gameSession = pgTable("game_session", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  challengeType: text("challenge_type").notNull().default("OAB_1_FASE"), // "OAB_1_FASE" or "CONCURSOS_MPSP"
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
  lives: integer("lives").notNull().default(3),
  correctAnswers: integer("correct_answers").notNull().default(0),
  incorrectAnswers: integer("incorrect_answers").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  questionNumber: integer("question_number").notNull().default(1),
  totalQuestions: integer("total_questions").notNull().default(20),
  isGameOver: boolean("is_game_over").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nova tabela para armazenar as respostas dos usuários
export const userAnswers = pgTable("user_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  questionId: varchar("question_id").notNull(),
  userAnswerIndex: integer("user_answer_index").notNull(), // -1 for timeout, 0-3 for multiple choice
  correctAnswerIndex: integer("correct_answer_index").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").notNull(), // Time spent on question in seconds
  challengeType: text("challenge_type").notNull(),
  category: text("category").notNull(),
  difficulty: integer("difficulty").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(15, "Telefone muito longo"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSession).omit({
  id: true,
  createdAt: true,
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSession.$inferSelect;
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type UserAnswer = typeof userAnswers.$inferSelect;

// Additional types for game state
export const answerSchema = z.object({
  questionId: z.string(),
  answerIndex: z.number().min(-1).max(3), // -1 for timeout, 0-3 for multiple choice
  timeRemaining: z.number().optional(),
});

export const powerUpSchema = z.object({
  type: z.enum(["fiftyFifty", "extraTime", "skip"]),
  questionId: z.string().optional(),
});

export type Answer = z.infer<typeof answerSchema>;
export type PowerUp = z.infer<typeof powerUpSchema>;
