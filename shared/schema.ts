import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  options: text("options").array().notNull(), // Array of 4 options
  correctAnswerIndex: integer("correct_answer_index").notNull(), // 0-3
  difficulty: integer("difficulty").notNull().default(1), // 1-5 stars
  category: text("category").notNull().default("Processo Civil"),
  explanation: text("explanation"),
});

export const gameSession = pgTable("game_session", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
  lives: integer("lives").notNull().default(3),
  correctAnswers: integer("correct_answers").notNull().default(0),
  incorrectAnswers: integer("incorrect_answers").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  questionNumber: integer("question_number").notNull().default(1),
  totalQuestions: integer("total_questions").notNull().default(20),
  isGameOver: boolean("is_game_over").notNull().default(false),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSession).omit({
  id: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSession.$inferSelect;

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
