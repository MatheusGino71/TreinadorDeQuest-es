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

  // Start new game session
  app.post("/api/game/start", async (req, res) => {
    try {
      const { userId, challengeType = "OAB_1_FASE" } = req.body;
      
      // Get all available questions for the challenge type to determine total
      const availableQuestions = await storage.getQuestions(challengeType);
      const totalQuestionsCount = availableQuestions.length;
      
      // Create game session with dynamic question count (sem sistema de vidas)
      const sessionData: InsertGameSession = {
        userId: userId || 1, // Default user ID if not provided
        challengeType,
        score: 0,
        level: 1,
        lives: 999, // Sistema de vidas removido - infinitas
        correctAnswers: 0,
        incorrectAnswers: 0,
        currentStreak: 0,
        questionNumber: 1,
        totalQuestions: totalQuestionsCount,
        isGameOver: false
      };
      
      const session = await storage.createGameSession(sessionData);
      const questions = await storage.getRandomQuestions(totalQuestionsCount, challengeType);
      
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

      const updatedSession = await storage.updateGameSession(sessionId, {
        score: session.score + scoreIncrease,
        correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: session.incorrectAnswers + (isCorrect ? 0 : 1),
        currentStreak: isCorrect ? session.currentStreak + 1 : 0,
        lives: 999, // Sistema de vidas removido - sempre infinitas
        questionNumber: session.questionNumber + 1,
        isGameOver: session.questionNumber >= session.totalQuestions, // Game over apenas quando acabam as questões
      });

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

  const httpServer = createServer(app);
  return httpServer;
}
