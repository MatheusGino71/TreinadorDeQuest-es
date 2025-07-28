import { randomUUID } from "crypto";
import type { 
  User, 
  Question, 
  GameSession, 
  InsertUser,
  InsertGameSession 
} from "@shared/schema";
import { questionsFromExcel } from "./questions-data.js";

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

export const storage = new MemStorage();