import { randomUUID } from "crypto";
import type { 
  User, 
  Question, 
  GameSession, 
  InsertUser,
  InsertGameSession,
  UserAnswer,
  InsertUserAnswer
} from "@shared/schema";
import { users, questions, gameSession, userAnswers } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
// Import commented out - using database questions instead
// import { questionsFromNewExcel } from "./questions-data";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Question operations
  getQuestions(challengeType?: string): Promise<Question[]>;
  getRandomQuestions(count: number, challengeType?: string): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;
  getAllCategories(challengeType?: string): Promise<string[]>;
  getQuestionCountByCategory(challengeType?: string): Promise<Record<string, number>>;

  // Game session operations
  createGameSession(insertGameSession: InsertGameSession): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | undefined>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;

  // User answer operations
  saveUserAnswer(insertUserAnswer: InsertUserAnswer): Promise<UserAnswer>;
  getSessionAnswers(sessionId: string): Promise<UserAnswer[]>;
  getUserAnswers(userId: string, limit?: number): Promise<UserAnswer[]>;
  getUserAnswersBySession(sessionId: string): Promise<UserAnswer[]>;
  getUserStats(userId: string, challengeType?: string): Promise<{
    totalAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageTimeSpent: number;
    categoryStats: Array<{
      category: string;
      total: number;
      correct: number;
      percentage: number;
    }>;
  }>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private questions = new Map<string, Question>();
  private gameSessions = new Map<string, GameSession>();

  constructor() {
    this.initializeQuestions();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Username not implemented in current schema
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Question operations
  async getQuestions(challengeType?: string): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    if (!challengeType) return allQuestions;
    return allQuestions.filter(q => q.challengeType === challengeType);
  }

  async getRandomQuestions(count: number, challengeType?: string, category?: string): Promise<Question[]> {
    let query = db.select().from(questions);
    
    if (challengeType && category) {
      query = query.where(
        sql`${questions.challengeType} = ${challengeType} AND ${questions.category} = ${category}`
      ) as any;
    } else if (challengeType) {
      query = query.where(eq(questions.challengeType, challengeType)) as any;
    } else if (category) {
      query = query.where(eq(questions.category, category)) as any;
    }
    
    const results = await query;
    
    // Mapear snake_case do DB para camelCase esperado pelo frontend
    const mappedQuestions = results.map(q => {
      const mapped = { ...q } as any;
      if (mapped.correct_answer_index !== undefined) {
        mapped.correctAnswerIndex = mapped.correct_answer_index;
        delete mapped.correct_answer_index;
      }
      if (mapped.challenge_type !== undefined) {
        mapped.challengeType = mapped.challenge_type;
        delete mapped.challenge_type;
      }
      return mapped as Question;
    });
    
    // Shuffle and return requested count
    const shuffled = mappedQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, mappedQuestions.length));
  }

  async getAllCategories(): Promise<string[]> {
    try {
      const results = await db
        .selectDistinct({ category: questions.category })
        .from(questions)
        .where(sql`${questions.category} IS NOT NULL`)
        .orderBy(questions.category);
      
      return results.map(r => r.category).filter(Boolean);
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getQuestionCountByCategory(): Promise<Record<string, { total: number; oab: number; concursos: number }>> {
    try {
      const categoryCounts = await db
        .select({
          category: questions.category,
          challengeType: questions.challengeType,
          count: sql<number>`count(*)`
        })
        .from(questions)
        .where(sql`${questions.category} IS NOT NULL`)
        .groupBy(questions.category, questions.challengeType)
        .orderBy(questions.category);

      const result: Record<string, { total: number; oab: number; concursos: number }> = {};

      categoryCounts.forEach(item => {
        if (!item.category) return;
        
        if (!result[item.category]) {
          result[item.category] = { total: 0, oab: 0, concursos: 0 };
        }
        
        const count = Number(item.count);
        result[item.category].total += count;
        
        if (item.challengeType === 'OAB_1_FASE') {
          result[item.category].oab = count;
        } else if (item.challengeType === 'CONCURSOS_MPSP') {
          result[item.category].concursos = count;
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting category counts:', error);
      return {};
    }
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getAllCategories(challengeType?: string): Promise<string[]> {
    const allQuestions = Array.from(this.questions.values());
    const filteredQuestions = challengeType 
      ? allQuestions.filter(q => q.challengeType === challengeType)
      : allQuestions;
    
    const categories = [...new Set(filteredQuestions.map(q => q.category))];
    return categories.sort();
  }

  async getQuestionCountByCategory(challengeType?: string): Promise<Record<string, number>> {
    const allQuestions = Array.from(this.questions.values());
    const filteredQuestions = challengeType 
      ? allQuestions.filter(q => q.challengeType === challengeType)
      : allQuestions;
    
    const result: Record<string, number> = {};
    filteredQuestions.forEach(q => {
      result[q.category] = (result[q.category] || 0) + 1;
    });
    
    return result;
  }

  // Game session operations
  async createGameSession(insertGameSession: InsertGameSession): Promise<GameSession> {
    const id = randomUUID();
    const gameSession: GameSession = {
      id,
      ...insertGameSession,
      createdAt: new Date()
    };
    this.gameSessions.set(id, gameSession);
    return gameSession;
  }

  async getGameSession(id: string): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const session = this.gameSessions.get(id);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      ...updates
    };
    
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }

  // User answer operations (MemStorage - basic implementation)
  async saveUserAnswer(insertUserAnswer: InsertUserAnswer): Promise<UserAnswer> {
    const userAnswer: UserAnswer = {
      id: randomUUID(),
      ...insertUserAnswer,
      createdAt: new Date()
    };
    return userAnswer;
  }

  async getSessionAnswers(sessionId: string): Promise<UserAnswer[]> {
    return [];
  }

  async getUserAnswers(userId: string, limit: number = 100): Promise<UserAnswer[]> {
    return [];
  }

  async getUserAnswersBySession(sessionId: string): Promise<UserAnswer[]> {
    return [];
  }

  async getUserStats(userId: string, challengeType?: string): Promise<{
    totalAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageTimeSpent: number;
    categoryStats: Array<{
      category: string;
      total: number;
      correct: number;
      percentage: number;
    }>;
  }> {
    return {
      totalAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageTimeSpent: 0,
      categoryStats: []
    };
  }

  private initializeQuestions() {
    // Questions loaded from database in DatabaseStorage
    // This method is for MemStorage only - keeping empty for now
  }
}

// PostgreSQL Storage Implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: Username functionality not implemented in current schema
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { role?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return allUsers.map(user => ({
      ...user,
      password: undefined // Remove password from response
    })) as User[];
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async getAdminStats(): Promise<any> {
    try {
      // Total users
      const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
      
      // Active users (logged in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = await db
        .select({ count: sql`count(*)` })
        .from(users)
        .where(sql`${users.lastLoginAt} > ${thirtyDaysAgo}`);

      // Total questions
      const totalQuestions = await db.select({ count: sql`count(*)` }).from(questions);
      
      // Questions by type
      const questionsOAB = await db
        .select({ count: sql`count(*)` })
        .from(questions)
        .where(eq(questions.challengeType, 'OAB_1_FASE'));
        
      const questionsConcursos = await db
        .select({ count: sql`count(*)` })
        .from(questions)
        .where(eq(questions.challengeType, 'CONCURSOS_MPSP'));

      // Total sessions
      const totalSessions = await db.select({ count: sql`count(*)` }).from(gameSession);
      
      // Average session score
      const avgScore = await db
        .select({ avg: sql`avg(${gameSession.score})` })
        .from(gameSession);

      // Top categories
      const topCategories = await db
        .select({
          category: questions.category,
          count: sql`count(*)`
        })
        .from(questions)
        .groupBy(questions.category)
        .orderBy(sql`count(*) desc`)
        .limit(5);

      return {
        totalUsers: Number(totalUsers[0]?.count || 0),
        activeUsers: Number(activeUsers[0]?.count || 0),
        totalQuestions: Number(totalQuestions[0]?.count || 0),
        questionsOAB: Number(questionsOAB[0]?.count || 0),
        questionsConcursos: Number(questionsConcursos[0]?.count || 0),
        totalSessions: Number(totalSessions[0]?.count || 0),
        avgSessionScore: Math.round(Number(avgScore[0]?.avg || 0)),
        topCategories: topCategories.map(cat => ({
          category: cat.category,
          count: Number(cat.count)
        }))
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalQuestions: 0,
        questionsOAB: 0,
        questionsConcursos: 0,
        totalSessions: 0,
        avgSessionScore: 0,
        topCategories: []
      };
    }
  }

  async getRecentSessions(): Promise<any[]> {
    try {
      const sessions = await db
        .select({
          id: gameSession.id,
          userId: gameSession.userId,
          challengeType: gameSession.challengeType,
          score: gameSession.score,
          isGameOver: gameSession.isGameOver,
          createdAt: gameSession.createdAt,
          userName: users.name
        })
        .from(gameSession)
        .leftJoin(users, eq(gameSession.userId, users.id))
        .orderBy(sql`${gameSession.createdAt} desc`)
        .limit(20);

      return sessions;
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      return [];
    }
  }

  // Question operations - using PostgreSQL data
  async getQuestions(challengeType?: string): Promise<Question[]> {
    let results;
    if (!challengeType) {
      results = await db.select().from(questions);
    } else {
      results = await db.select().from(questions).where(eq(questions.challengeType, challengeType));
    }
    
    // Mapear snake_case do DB para camelCase esperado pelo frontend
    return results.map(q => {
      const mapped = { ...q } as any;
      mapped.correctAnswerIndex = mapped.correct_answer_index;
      delete mapped.correct_answer_index;
      return mapped;
    });
  }

  async getRandomQuestions(count: number = 20, challengeType?: string): Promise<Question[]> {
    let results;
    if (!challengeType) {
      results = await db.select().from(questions).orderBy(sql`RANDOM()`).limit(count);
    } else {
      results = await db.select().from(questions)
        .where(eq(questions.challengeType, challengeType))
        .orderBy(sql`RANDOM()`)
        .limit(count);
    }
    
    // Mapear snake_case do DB para camelCase esperado pelo frontend
    return results.map(q => {
      const mapped = { ...q } as any;
      mapped.correctAnswerIndex = mapped.correct_answer_index;
      delete mapped.correct_answer_index;
      return mapped;
    });
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    if (!question) return undefined;
    
    // Mapear snake_case do DB para camelCase esperado pelo frontend
    const mapped = { ...question } as any;
    mapped.correctAnswerIndex = mapped.correct_answer_index;
    delete mapped.correct_answer_index;
    return mapped;
  }

  async getAllCategories(challengeType?: string): Promise<string[]> {
    let query = db.selectDistinct({ category: questions.category }).from(questions);
    
    if (challengeType) {
      query = query.where(eq(questions.challengeType, challengeType)) as any;
    }
    
    const result = await query;
    return result.map(r => r.category).sort();
  }

  async getQuestionCountByCategory(challengeType?: string): Promise<Record<string, number>> {
    let query = db
      .select({
        category: questions.category,
        count: sql`count(*)`
      })
      .from(questions)
      .groupBy(questions.category);
    
    if (challengeType) {
      query = query.where(eq(questions.challengeType, challengeType)) as any;
    }
    
    const result = await query;
    const counts: Record<string, number> = {};
    
    result.forEach(r => {
      counts[r.category] = Number(r.count);
    });
    
    return counts;
  }

  // Game session operations
  async createGameSession(insertGameSession: InsertGameSession): Promise<GameSession> {
    const [session] = await db
      .insert(gameSession)
      .values(insertGameSession)
      .returning();
    return session;
  }

  async getGameSession(id: string): Promise<GameSession | undefined> {
    const [session] = await db.select().from(gameSession).where(eq(gameSession.id, id));
    return session || undefined;
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const [session] = await db
      .update(gameSession)
      .set(updates)
      .where(eq(gameSession.id, id))
      .returning();
    return session || undefined;
  }

  // User answer operations
  async saveUserAnswer(insertUserAnswer: InsertUserAnswer): Promise<UserAnswer> {
    const [userAnswer] = await db
      .insert(userAnswers)
      .values(insertUserAnswer)
      .returning();
    return userAnswer;
  }

  async getSessionAnswers(sessionId: string): Promise<UserAnswer[]> {
    return await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.sessionId, sessionId))
      .orderBy(userAnswers.createdAt);
  }

  async getUserAnswers(userId: string, limit: number = 100): Promise<UserAnswer[]> {
    return await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.userId, userId))
      .orderBy(sql`${userAnswers.createdAt} DESC`)
      .limit(limit);
  }

  async getUserAnswersBySession(sessionId: string): Promise<UserAnswer[]> {
    return await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.sessionId, sessionId))
      .orderBy(sql`${userAnswers.createdAt} ASC`);
  }

  async getUserStats(userId: string, challengeType?: string): Promise<{
    totalAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageTimeSpent: number;
    categoryStats: Array<{
      category: string;
      total: number;
      correct: number;
      percentage: number;
    }>;
  }> {
    let query = db.select().from(userAnswers).where(eq(userAnswers.userId, userId));
    
    if (challengeType) {
      query = query.where(eq(userAnswers.challengeType, challengeType));
    }

    const answers = await query;
    
    const totalAnswered = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = totalAnswered - correctAnswers;
    const averageTimeSpent = totalAnswered > 0 
      ? Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalAnswered)
      : 0;

    // Category stats
    const categoryMap = new Map<string, {total: number, correct: number}>();
    answers.forEach(answer => {
      const current = categoryMap.get(answer.category) || {total: 0, correct: 0};
      current.total++;
      if (answer.isCorrect) current.correct++;
      categoryMap.set(answer.category, current);
    });

    const categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100)
    })).sort((a, b) => b.total - a.total);

    return {
      totalAnswered,
      correctAnswers,
      incorrectAnswers,
      averageTimeSpent,
      categoryStats
    };
  }
}

export const storage = new DatabaseStorage();