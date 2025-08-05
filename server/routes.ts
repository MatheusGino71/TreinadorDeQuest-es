import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { answerSchema, powerUpSchema, insertUserSchema, loginUserSchema, type Question, type InsertGameSession } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Don't validate username - we'll auto-generate it
      const { name, email, password, phone } = req.body;
      
      // Basic validation
      if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user with auto-generated username
      const user = await storage.createUser({
        username: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, // Auto-generate username
        name,
        email,
        password: hashedPassword,
        phone,
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erro ao criar conta" });
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }
      
      // Update last login
      await storage.updateUserLastLogin(user.id);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  // Questions count endpoint
  app.get("/api/questions/count", async (req, res) => {
    try {
      console.log("Getting questions count...");
      const oabQuestions = await storage.getQuestions("OAB_1_FASE");
      const concursosQuestions = await storage.getQuestions("CONCURSOS_MPSP");
      
      const result = {
        OAB_1_FASE: oabQuestions.length,
        CONCURSOS_MPSP: concursosQuestions.length,
        total: oabQuestions.length + concursosQuestions.length
      };
      
      console.log("Questions count:", result);
      res.json(result);
    } catch (error) {
      console.error("Error counting questions:", error);
      res.status(500).json({ error: "Failed to count questions" });
    }
  });

  // Get all categories available
  app.get("/api/questions/categories", async (req, res) => {
    try {
      const { challengeType } = req.query;
      const categories = await storage.getAllCategories(challengeType as string);
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ message: "Failed to get categories" });
    }
  });

  // Get questions count by category
  app.get("/api/questions/count-by-category", async (req, res) => {
    try {
      const { challengeType } = req.query;
      const categoryCounts = await storage.getQuestionCountByCategory(challengeType as string);
      res.json(categoryCounts);
    } catch (error) {
      console.error("Error getting category counts:", error);
      res.status(500).json({ message: "Failed to get category counts" });
    }
  });

  // Start new game session
  app.post("/api/game/start", async (req, res) => {
    try {
      const { userId, challengeType = "OAB_1_FASE", category } = req.body;
      
      // Limitando a 20 questões por sessão conforme solicitado
      const sessionQuestionLimit = 20;
      
      // Create game session with dynamic question count (sem sistema de vidas)
      const sessionData: InsertGameSession = {
        userId: userId || "anonymous-user", // Use provided userId or default
        challengeType,
        score: 0,
        level: 1,
        lives: 3, // Sistema de vidas restaurado
        correctAnswers: 0,
        incorrectAnswers: 0,
        currentStreak: 0,
        questionNumber: 1,
        totalQuestions: sessionQuestionLimit,
        isGameOver: false
      };
      
      const session = await storage.createGameSession(sessionData);
      // Retornar apenas 20 questões aleatórias por sessão (filtradas por categoria se especificada)
      const questions = await storage.getRandomQuestions(20, challengeType, category);
      
      res.json({
        session,
        questions: questions.map((q: Question) => ({ 
          id: q.id, 
          text: q.text, 
          options: q.options, 
          difficulty: q.difficulty, 
          category: q.category, 
          challengeType: q.challengeType 
        })),
      });
    } catch (error) {
      console.error("Start game error:", error);
      res.status(500).json({ message: "Failed to start game session" });
    }
  });

  // Get game session
  app.get("/api/game/session/:id", async (req, res) => {
    try {
      const session = await storage.getGameSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Game session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game session" });
    }
  });

  // Submit answer
  app.post("/api/game/answer", async (req, res) => {
    try {
      const { questionId, answerIndex, timeRemaining } = answerSchema.parse(req.body);
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      const question = await storage.getQuestionById(questionId);
      const session = await storage.getGameSession(sessionId);

      if (!question || !session) {
        return res.status(404).json({ message: "Question or session not found" });
      }

      const isCorrect = answerIndex >= 0 && answerIndex === question.correctAnswerIndex;
      let scoreIncrease = 0;

      if (isCorrect) {
        // Base score + difficulty bonus + time bonus
        scoreIncrease = 100 + (question.difficulty * 20) + (timeRemaining || 0);
        // Streak bonus
        if (session.currentStreak >= 3) {
          scoreIncrease += session.currentStreak * 10;
        }
      }

      const newLives = isCorrect ? session.lives : Math.max(0, session.lives - 1);
      const isGameOver = !isCorrect && newLives <= 0; // Game over apenas quando vidas acabam
      
      const updatedSession = await storage.updateGameSession(sessionId, {
        score: session.score + scoreIncrease,
        correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: session.incorrectAnswers + (isCorrect ? 0 : 1),
        currentStreak: isCorrect ? session.currentStreak + 1 : 0,
        lives: newLives,
        questionNumber: session.questionNumber + 1,
        isGameOver: isGameOver
      });

      // Save user answer to database for tracking
      if (updatedSession) {
        try {
          await storage.saveUserAnswer({
            userId: session.userId,
            sessionId: session.id,
            questionId: question.id,
            userAnswerIndex: answerIndex,
            correctAnswerIndex: question.correctAnswerIndex || 0, // Default to 0 if null
            isCorrect: isCorrect,
            timeSpent: 60 - (timeRemaining || 0), // Calculate time spent
            challengeType: session.challengeType,
            category: question.category,
            difficulty: question.difficulty
          });
        } catch (error) {
          console.error("Error saving user answer:", error);
          // Don't fail the request if answer saving fails
        }
      }

      res.json({
        correct: isCorrect,
        scoreIncrease,
        explanation: question.explanation,
        session: updatedSession,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Use power-up
  app.post("/api/game/powerup", async (req, res) => {
    try {
      const { type } = powerUpSchema.parse(req.body);
      const { sessionId, questionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      let result: any = { success: true };

      switch (type) {
        case "fiftyFifty":
          if (questionId) {
            const question = await storage.getQuestionById(questionId);
            if (question) {
              // Return 2 wrong options to eliminate (keep correct + 1 wrong)
              const wrongIndices = [0, 1, 2, 3].filter(i => i !== question.correctAnswerIndex);
              const eliminateIndices = wrongIndices.slice(0, 2); // Eliminate 2 wrong options
              result.eliminateIndices = eliminateIndices;
            }
          }
          result.message = "50/50 ativado - 2 opções eliminadas";
          break;
        case "extraTime":
          result.extraTime = 10;
          result.message = "+10 seconds added";
          break;
        case "skip":
          const session = await storage.getGameSession(sessionId);
          if (session) {
            await storage.updateGameSession(sessionId, {
              questionNumber: session.questionNumber + 1,
            });
          }
          result.message = "Question skipped";
          break;
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid power-up request" });
    }
  });

  // Get all questions (for statistics modal)
  app.get("/api/questions/all", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error getting all questions:", error);
      res.status(500).json({ message: "Failed to get questions" });
    }
  });

  // Get session answers (for statistics modal)
  app.get("/api/session/:sessionId/answers", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const answers = await storage.getSessionAnswers(sessionId);
      res.json(answers);
    } catch (error) {
      console.error("Error getting session answers:", error);
      res.status(500).json({ message: "Failed to get session answers" });
    }
  });

  // User statistics endpoints
  app.get("/api/user/:userId/stats", async (req, res) => {
    try {
      const { userId } = req.params;
      const { challengeType } = req.query;
      
      const stats = await storage.getUserStats(userId, challengeType as string);
      res.json(stats);
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // User answer history
  app.get("/api/user/:userId/answers", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      
      const answers = await storage.getUserAnswers(userId, limit ? parseInt(limit as string) : undefined);
      res.json(answers);
    } catch (error) {
      console.error("Error getting user answers:", error);
      res.status(500).json({ message: "Failed to get user answers" });
    }
  });

  // Session answer history
  app.get("/api/session/:sessionId/answers", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const answers = await storage.getUserAnswersBySession(sessionId);
      res.json(answers);
    } catch (error) {
      console.error("Error getting session answers:", error);
      res.status(500).json({ message: "Failed to get session answers" });
    }
  });

  // Middleware para verificar se é admin
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Token de acesso necessário" });
      }

      // Por simplificação, vamos usar o email no header por enquanto
      // Em produção, usar JWT tokens
      const email = authHeader.replace('Bearer ', '');
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado - Admin necessário" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Token inválido" });
    }
  };

  // ADMIN ROUTES
  
  // Estatísticas administrativas
  // Admin export questions route
  app.get("/api/admin/export/questions", isAdmin, async (req, res) => {
    try {
      const { category, challengeType, format = 'json' } = req.query;
      
      let questions;
      if (category && challengeType) {
        questions = await storage.getRandomQuestions(1000, challengeType as string, category as string);
      } else if (challengeType) {
        questions = await storage.getRandomQuestions(1000, challengeType as string);
      } else {
        questions = await storage.getRandomQuestions(1000);
      }

      if (format === 'xlsx') {
        // Return Excel-formatted data
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="questoes_${category || challengeType || 'todas'}.json"`);
        
        const excelData = questions.map(q => ({
          ID: q.id,
          Categoria: q.category,
          Tipo: q.challengeType,
          Questao: q.questionText,
          AlternativaA: q.options[0],
          AlternativaB: q.options[1],
          AlternativaC: q.options[2],
          AlternativaD: q.options[3],
          RespostaCorreta: q.correctAnswer,
          Explicacao: q.explanation,
          Dificuldade: q.difficulty
        }));
        
        res.json(excelData);
      } else {
        // Return JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="questoes_${category || challengeType || 'todas'}.json"`);
        res.json(questions);
      }
    } catch (error) {
      console.error("Error exporting questions:", error);
      res.status(500).json({ message: "Erro ao exportar questões" });
    }
  });

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting admin stats:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Listar todos os usuários
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  // Atualizar usuário
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role, isActive } = req.body;
      
      const updatedUser = await storage.updateUser(id, { role, isActive });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });

  // Deletar usuário
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: "Usuário removido com sucesso" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Erro ao remover usuário" });
    }
  });

  // Sessões recentes
  app.get("/api/admin/sessions/recent", isAdmin, async (req, res) => {
    try {
      const sessions = await storage.getRecentSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error getting recent sessions:", error);
      res.status(500).json({ message: "Erro ao buscar sessões" });
    }
  });

  // Criar usuário admin (endpoint temporário para criar primeiro admin)
  app.post("/api/admin/create-admin", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      
      // Verificar se já existe admin
      const existingAdmin = await storage.getUserByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin já existe" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create admin user
      const adminUser = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'admin'
      });
      
      const { password: _, ...userWithoutPassword } = adminUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Erro ao criar admin" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
