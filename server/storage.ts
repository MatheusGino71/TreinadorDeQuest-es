import { randomUUID } from "crypto";
import type { 
  User, 
  Question, 
  GameSession, 
  InsertUser,
  InsertGameSession 
} from "@shared/schema";
import { users, questions, gameSession } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Question operations
  getQuestions(challengeType?: string): Promise<Question[]>;
  getRandomQuestions(count: number, challengeType?: string): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;

  // Game session operations
  createGameSession(insertGameSession: InsertGameSession): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | undefined>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private questions = new Map<string, Question>();
  private gameSessions = new Map<string, GameSession>();

  constructor() {
    this.initializeQuestions();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.users.size + 1;
    const user: User = {
      id,
      ...insertUser,
      username: insertUser.username || `user_${id}`,
      createdAt: new Date()
    };
    this.users.set(String(id), user);
    return user;
  }

  // Question operations
  async getQuestions(challengeType?: string): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    if (!challengeType) return allQuestions;
    return allQuestions.filter(q => q.challengeType === challengeType);
  }

  async getRandomQuestions(count: number, challengeType?: string): Promise<Question[]> {
    const questions = await this.getQuestions(challengeType);
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, questions.length));
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
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

  private initializeQuestions() {
    // Usar TODAS as 50 questões do arquivo Excel processado
    questionsFromExcel.forEach((questionData, index) => {
      const id = `Q${String(index + 1).padStart(3, '0')}`;
      const question: Question = {
        id,
        ...questionData
      };
      this.questions.set(id, question);
    });
  }
}

// PostgreSQL Storage Implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  // Question operations - using PostgreSQL data
  async getQuestions(challengeType?: string): Promise<Question[]> {
    if (!challengeType) {
      return await db.select().from(questions);
    }
    return await db.select().from(questions).where(eq(questions.challengeType, challengeType));
  }

  async getRandomQuestions(count: number, challengeType?: string): Promise<Question[]> {
    if (!challengeType) {
      return await db.select().from(questions).orderBy(sql`RANDOM()`).limit(count);
    }
    return await db.select().from(questions)
      .where(eq(questions.challengeType, challengeType))
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
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
}

export const storage = new DatabaseStorage();