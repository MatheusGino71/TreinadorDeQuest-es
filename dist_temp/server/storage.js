import { randomUUID } from "crypto";
import { users, questions, gameSession, userAnswers } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
export class MemStorage {
    constructor() {
        this.users = new Map();
        this.questions = new Map();
        this.gameSessions = new Map();
        this.initializeQuestions();
    }
    // User operations
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        // Username not implemented in current schema
        return undefined;
    }
    async getUserByEmail(email) {
        return Array.from(this.users.values()).find(user => user.email === email);
    }
    async createUser(insertUser) {
        const id = randomUUID();
        const user = {
            id,
            ...insertUser,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(id, user);
        return user;
    }
    // Question operations
    async getQuestions(challengeType) {
        const allQuestions = Array.from(this.questions.values());
        if (!challengeType)
            return allQuestions;
        return allQuestions.filter(q => q.challengeType === challengeType);
    }
    async getRandomQuestions(count, challengeType, category) {
        let query = db.select().from(questions);
        if (challengeType && category) {
            query = query.where(sql `${questions.challengeType} = ${challengeType} AND ${questions.category} = ${category}`);
        }
        else if (challengeType) {
            query = query.where(eq(questions.challengeType, challengeType));
        }
        else if (category) {
            query = query.where(eq(questions.category, category));
        }
        const results = await query;
        // Mapear snake_case do DB para camelCase esperado pelo frontend
        const mappedQuestions = results.map(q => {
            const mapped = { ...q };
            if (mapped.correct_answer_index !== undefined) {
                mapped.correctAnswerIndex = mapped.correct_answer_index;
                delete mapped.correct_answer_index;
            }
            if (mapped.challenge_type !== undefined) {
                mapped.challengeType = mapped.challenge_type;
                delete mapped.challenge_type;
            }
            return mapped;
        });
        // Shuffle and return requested count
        const shuffled = mappedQuestions.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, mappedQuestions.length));
    }
    async getAllCategories() {
        try {
            const results = await db
                .selectDistinct({ category: questions.category })
                .from(questions)
                .where(sql `${questions.category} IS NOT NULL`)
                .orderBy(questions.category);
            return results.map(r => r.category).filter(Boolean);
        }
        catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }
    async getQuestionCountByCategory() {
        try {
            const categoryCounts = await db
                .select({
                category: questions.category,
                challengeType: questions.challengeType,
                count: sql `count(*)`
            })
                .from(questions)
                .where(sql `${questions.category} IS NOT NULL`)
                .groupBy(questions.category, questions.challengeType)
                .orderBy(questions.category);
            const result = {};
            categoryCounts.forEach(item => {
                if (!item.category)
                    return;
                if (!result[item.category]) {
                    result[item.category] = { total: 0, oab: 0, concursos: 0 };
                }
                const count = Number(item.count);
                result[item.category].total += count;
                if (item.challengeType === 'OAB_1_FASE') {
                    result[item.category].oab = count;
                }
                else if (item.challengeType === 'CONCURSOS_MPSP') {
                    result[item.category].concursos = count;
                }
            });
            return result;
        }
        catch (error) {
            console.error('Error getting category counts:', error);
            return {};
        }
    }
    async getQuestionById(id) {
        return this.questions.get(id);
    }
    async getAllCategories(challengeType) {
        const allQuestions = Array.from(this.questions.values());
        const filteredQuestions = challengeType
            ? allQuestions.filter(q => q.challengeType === challengeType)
            : allQuestions;
        const categories = [...new Set(filteredQuestions.map(q => q.category))];
        return categories.sort();
    }
    async getQuestionCountByCategory(challengeType) {
        const allQuestions = Array.from(this.questions.values());
        const filteredQuestions = challengeType
            ? allQuestions.filter(q => q.challengeType === challengeType)
            : allQuestions;
        const result = {};
        filteredQuestions.forEach(q => {
            result[q.category] = (result[q.category] || 0) + 1;
        });
        return result;
    }
    // Game session operations
    async createGameSession(insertGameSession) {
        const id = randomUUID();
        const gameSession = {
            id,
            ...insertGameSession,
            createdAt: new Date()
        };
        this.gameSessions.set(id, gameSession);
        return gameSession;
    }
    async getGameSession(id) {
        return this.gameSessions.get(id);
    }
    async updateGameSession(id, updates) {
        const session = this.gameSessions.get(id);
        if (!session)
            return undefined;
        const updatedSession = {
            ...session,
            ...updates
        };
        this.gameSessions.set(id, updatedSession);
        return updatedSession;
    }
    // User answer operations (MemStorage - basic implementation)
    async saveUserAnswer(insertUserAnswer) {
        const userAnswer = {
            id: randomUUID(),
            ...insertUserAnswer,
            createdAt: new Date()
        };
        return userAnswer;
    }
    async getSessionAnswers(sessionId) {
        return [];
    }
    async getUserAnswers(userId, limit = 100) {
        return [];
    }
    async getUserAnswersBySession(sessionId) {
        return [];
    }
    async getUserStats(userId, challengeType) {
        return {
            totalAnswered: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            averageTimeSpent: 0,
            categoryStats: []
        };
    }
    initializeQuestions() {
        // Questions loaded from database in DatabaseStorage
        // This method is for MemStorage only - keeping empty for now
    }
}
// PostgreSQL Storage Implementation
export class DatabaseStorage {
    // User operations
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        // Note: Username functionality not implemented in current schema
        return undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || undefined;
    }
    async createUser(insertUser) {
        const [user] = await db
            .insert(users)
            .values(insertUser)
            .returning();
        return user;
    }
    async updateUserLastLogin(userId) {
        await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, userId));
    }
    async getAllUsers() {
        const allUsers = await db.select().from(users).orderBy(users.createdAt);
        return allUsers.map(user => ({
            ...user,
            password: undefined // Remove password from response
        }));
    }
    async updateUser(userId, updates) {
        const [updatedUser] = await db
            .update(users)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    }
    async deleteUser(userId) {
        await db.delete(users).where(eq(users.id, userId));
    }
    async getAdminStats() {
        try {
            // Total users
            const totalUsers = await db.select({ count: sql `count(*)` }).from(users);
            // Active users (logged in last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const activeUsers = await db
                .select({ count: sql `count(*)` })
                .from(users)
                .where(sql `${users.lastLoginAt} > ${thirtyDaysAgo}`);
            // Total questions
            const totalQuestions = await db.select({ count: sql `count(*)` }).from(questions);
            // Questions by type
            const questionsOAB = await db
                .select({ count: sql `count(*)` })
                .from(questions)
                .where(eq(questions.challengeType, 'OAB_1_FASE'));
            const questionsConcursos = await db
                .select({ count: sql `count(*)` })
                .from(questions)
                .where(eq(questions.challengeType, 'CONCURSOS_MPSP'));
            // Total sessions
            const totalSessions = await db.select({ count: sql `count(*)` }).from(gameSession);
            // Average session score
            const avgScore = await db
                .select({ avg: sql `avg(${gameSession.score})` })
                .from(gameSession);
            // Top categories
            const topCategories = await db
                .select({
                category: questions.category,
                count: sql `count(*)`
            })
                .from(questions)
                .groupBy(questions.category)
                .orderBy(sql `count(*) desc`)
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
        }
        catch (error) {
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
    async getRecentSessions() {
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
                .orderBy(sql `${gameSession.createdAt} desc`)
                .limit(20);
            return sessions;
        }
        catch (error) {
            console.error('Error getting recent sessions:', error);
            return [];
        }
    }
    // Question operations - using PostgreSQL data
    async getQuestions(challengeType) {
        let results;
        if (!challengeType) {
            results = await db.select().from(questions);
        }
        else {
            results = await db.select().from(questions).where(eq(questions.challengeType, challengeType));
        }
        // Mapear snake_case do DB para camelCase esperado pelo frontend
        return results.map(q => {
            const mapped = { ...q };
            mapped.correctAnswerIndex = mapped.correct_answer_index;
            delete mapped.correct_answer_index;
            return mapped;
        });
    }
    async getRandomQuestions(count = 20, challengeType) {
        let results;
        if (!challengeType) {
            results = await db.select().from(questions).orderBy(sql `RANDOM()`).limit(count);
        }
        else {
            results = await db.select().from(questions)
                .where(eq(questions.challengeType, challengeType))
                .orderBy(sql `RANDOM()`)
                .limit(count);
        }
        // Mapear snake_case do DB para camelCase esperado pelo frontend
        return results.map(q => {
            const mapped = { ...q };
            mapped.correctAnswerIndex = mapped.correct_answer_index;
            delete mapped.correct_answer_index;
            return mapped;
        });
    }
    async getQuestionById(id) {
        const [question] = await db.select().from(questions).where(eq(questions.id, id));
        if (!question)
            return undefined;
        // Mapear snake_case do DB para camelCase esperado pelo frontend
        const mapped = { ...question };
        mapped.correctAnswerIndex = mapped.correct_answer_index;
        delete mapped.correct_answer_index;
        return mapped;
    }
    async getAllCategories(challengeType) {
        let query = db.selectDistinct({ category: questions.category }).from(questions);
        if (challengeType) {
            query = query.where(eq(questions.challengeType, challengeType));
        }
        const result = await query;
        return result.map(r => r.category).sort();
    }
    async getQuestionCountByCategory(challengeType) {
        let query = db
            .select({
            category: questions.category,
            count: sql `count(*)`
        })
            .from(questions)
            .groupBy(questions.category);
        if (challengeType) {
            query = query.where(eq(questions.challengeType, challengeType));
        }
        const result = await query;
        const counts = {};
        result.forEach(r => {
            counts[r.category] = Number(r.count);
        });
        return counts;
    }
    // Game session operations
    async createGameSession(insertGameSession) {
        const [session] = await db
            .insert(gameSession)
            .values(insertGameSession)
            .returning();
        return session;
    }
    async getGameSession(id) {
        const [session] = await db.select().from(gameSession).where(eq(gameSession.id, id));
        return session || undefined;
    }
    async updateGameSession(id, updates) {
        const [session] = await db
            .update(gameSession)
            .set(updates)
            .where(eq(gameSession.id, id))
            .returning();
        return session || undefined;
    }
    // User answer operations
    async saveUserAnswer(insertUserAnswer) {
        const [userAnswer] = await db
            .insert(userAnswers)
            .values(insertUserAnswer)
            .returning();
        return userAnswer;
    }
    async getSessionAnswers(sessionId) {
        return await db
            .select()
            .from(userAnswers)
            .where(eq(userAnswers.sessionId, sessionId))
            .orderBy(userAnswers.createdAt);
    }
    async getUserAnswers(userId, limit = 100) {
        return await db
            .select()
            .from(userAnswers)
            .where(eq(userAnswers.userId, userId))
            .orderBy(sql `${userAnswers.createdAt} DESC`)
            .limit(limit);
    }
    async getUserAnswersBySession(sessionId) {
        return await db
            .select()
            .from(userAnswers)
            .where(eq(userAnswers.sessionId, sessionId))
            .orderBy(sql `${userAnswers.createdAt} ASC`);
    }
    async getUserStats(userId, challengeType) {
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
        const categoryMap = new Map();
        answers.forEach(answer => {
            const current = categoryMap.get(answer.category) || { total: 0, correct: 0 };
            current.total++;
            if (answer.isCorrect)
                current.correct++;
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
