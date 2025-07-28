import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import GameHeader from "@/components/game/GameHeader";
import QuestionCard from "@/components/game/QuestionCard";
import AnswerButtons from "@/components/game/AnswerButtons";
import Timer from "@/components/game/Timer";
import GameStats from "@/components/game/GameStats";
import PowerUps from "@/components/game/PowerUps";
import GameOverModal from "@/components/game/GameOverModal";
import PauseModal from "@/components/game/PauseModal";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  text: string;
  options: string[];
  difficulty: number;
  category: string;
  challengeType: string;
}

interface GameSession {
  id: string;
  score: number;
  level: number;
  lives: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  questionNumber: number;
  totalQuestions: number;
  isGameOver: boolean;
}

interface GameState {
  session: GameSession | null;
  questions: Question[];
  currentQuestionIndex: number;
  timeRemaining: number;
  isPaused: boolean;
  isGameOver: boolean;
  showGameOver: boolean;
  usedPowerUps: { [key: string]: boolean };
  eliminatedOptions: number[];
}

interface GameProps {
  user: any;
  onLogout: () => void;
}

export default function Game({ user, onLogout }: GameProps) {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    session: null,
    questions: [],
    currentQuestionIndex: 0,
    timeRemaining: 60, // Aumentado para 1 minuto
    isPaused: false,
    isGameOver: false,
    showGameOver: false,
    usedPowerUps: {},
    eliminatedOptions: [],
  });

  // Start game mutation
  const startGameMutation = useMutation({
    mutationFn: async () => {
      const challengeType = localStorage.getItem('game-challenge-type') || 'OAB_1_FASE';
      const response = await apiRequest("POST", "/api/game/start", {
        userId: user?.id,
        challengeType
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGameState(prev => ({
        ...prev,
        session: data.session,
        questions: data.questions,
        currentQuestionIndex: 0,
        timeRemaining: 60,
        isGameOver: false,
        showGameOver: false,
        usedPowerUps: {},
        eliminatedOptions: [],
      }));
      const challengeType = localStorage.getItem('game-challenge-type');
      toast({
        title: "Jogo iniciado!",
        description: `Boa sorte com as questões ${challengeType === 'OAB_1_FASE' ? 'da OAB 1ª Fase' : 'de Concursos'}!`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o jogo.",
        variant: "destructive",
      });
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answerIndex, timeRemaining }: { questionId: string; answerIndex: number; timeRemaining: number }) => {
      const response = await apiRequest("POST", "/api/game/answer", {
        sessionId: gameState.session?.id,
        questionId,
        answerIndex,
        timeRemaining,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGameState(prev => ({
        ...prev,
        session: data.session,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timeRemaining: 60,
        eliminatedOptions: [], // Reset eliminated options for next question
      }));

      // Show feedback
      toast({
        title: data.correct ? "Correto! 🎉" : "Incorreto 😞",
        description: data.explanation || (data.correct ? `+${data.scoreIncrease} pontos!` : "Tente novamente!"),
        variant: data.correct ? "default" : "destructive",
      });

      // Check if game is over
      if (data.session.isGameOver || gameState.currentQuestionIndex + 1 >= gameState.questions.length) {
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            isGameOver: true,
            showGameOver: true,
          }));
        }, 2000);
      }
    },
  });

  // Power-up mutation
  const usePowerUpMutation = useMutation({
    mutationFn: async ({ type, questionId }: { type: string; questionId?: string }) => {
      const response = await apiRequest("POST", "/api/game/powerup", {
        sessionId: gameState.session?.id,
        type,
        questionId,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setGameState(prev => ({
        ...prev,
        usedPowerUps: { ...prev.usedPowerUps, [variables.type]: true },
        ...(variables.type === "extraTime" ? { timeRemaining: prev.timeRemaining + 10 } : {}),
        ...(variables.type === "fiftyFifty" && data.eliminateIndices ? { eliminatedOptions: data.eliminateIndices } : {}),
      }));

      toast({
        title: "Power-up usado!",
        description: data.message,
      });
    },
  });

  // Timer effect
  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver || !gameState.session) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - submit random wrong answer
          const currentQuestion = prev.questions?.[prev.currentQuestionIndex];
          if (currentQuestion && prev.questions && prev.currentQuestionIndex < prev.questions.length) {
            submitAnswerMutation.mutate({
              questionId: currentQuestion.id,
              answerIndex: -1, // Invalid answer index to mark as incorrect
              timeRemaining: 0,
            });
          }
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPaused, gameState.isGameOver, gameState.session, gameState.currentQuestionIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.isPaused || gameState.isGameOver) return;

      const key = event.key.toLowerCase();
      const currentQuestion = gameState.questions?.[gameState.currentQuestionIndex];

      if (!currentQuestion || !gameState.questions || gameState.currentQuestionIndex >= gameState.questions.length) return;

      switch (key) {
        case "1":
          handleAnswer(0);
          break;
        case "2":
          handleAnswer(1);
          break;
        case "3":
          handleAnswer(2);
          break;
        case "4":
          handleAnswer(3);
          break;
        case "escape":
          togglePause();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [gameState]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (gameState.isPaused || gameState.isGameOver || submitAnswerMutation.isPending) return;

    const currentQuestion = gameState.questions?.[gameState.currentQuestionIndex];
    if (!currentQuestion || !gameState.questions || gameState.currentQuestionIndex >= gameState.questions.length) return;

    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      answerIndex,
      timeRemaining: gameState.timeRemaining,
    });
  }, [gameState, submitAnswerMutation]);

  const handlePowerUp = useCallback((type: string) => {
    if (gameState.usedPowerUps[type]) return;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    usePowerUpMutation.mutate({
      type,
      questionId: currentQuestion?.id,
    });
  }, [gameState, usePowerUpMutation]);

  const togglePause = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const startNewGame = useCallback(() => {
    startGameMutation.mutate();
  }, [startGameMutation]);

  const restartGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: false,
      showGameOver: false,
      eliminatedOptions: [],
    }));
    startGameMutation.mutate();
  }, [startGameMutation]);

  // Initialize game on mount
  useEffect(() => {
    startGameMutation.mutate();
  }, []);

  if (startGameMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-blue mx-auto mb-4"></div>
          <p className="text-game-text">Carregando o jogo...</p>
        </div>
      </div>
    );
  }

  if (!gameState.session || !gameState.questions || gameState.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-game-text mb-4">Erro ao carregar o jogo</p>
          <button
            onClick={startNewGame}
            className="bg-game-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = gameState.questions?.[gameState.currentQuestionIndex];
  const progress = gameState.questions ? (gameState.currentQuestionIndex / gameState.questions.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader
        session={gameState.session}
        user={user}
        onPause={togglePause}
        onLogout={onLogout}
      />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-game-text-secondary">Progresso da Sessão</span>
              <span className="text-sm text-game-text-secondary">
                Questão {gameState.currentQuestionIndex + 1} de {gameState.questions.length}
              </span>
            </div>
            <div className="w-full bg-game-surface rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-game-blue to-game-green h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Timer timeRemaining={gameState.timeRemaining} />

          {currentQuestion && (
            <>
              <QuestionCard
                question={currentQuestion}
                questionNumber={gameState.currentQuestionIndex + 1}
              />

              <AnswerButtons
                options={currentQuestion.options}
                eliminatedOptions={gameState.eliminatedOptions}
                onAnswer={handleAnswer}
                disabled={submitAnswerMutation.isPending || gameState.isPaused}
              />

              <PowerUps
                onUsePowerUp={handlePowerUp}
                usedPowerUps={gameState.usedPowerUps}
                disabled={gameState.isPaused}
              />
            </>
          )}

          <GameStats session={gameState.session} />
        </div>
      </main>

      <footer className="bg-game-surface border-t border-gray-600 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={togglePause}
              className="text-game-text-secondary hover:text-game-text transition-colors"
            >
              <i className={`fas ${gameState.isPaused ? 'fa-play' : 'fa-pause'} mr-2`}></i>
              {gameState.isPaused ? 'Continuar' : 'Pausar'}
            </button>
          </div>

          <div className="text-sm text-game-text-secondary">
            © 2024 Game OAB - Estudos Jurídicos Gamificados
          </div>

          <div className="flex space-x-4">
            <button
              onClick={restartGame}
              className="text-game-text-secondary hover:text-game-text transition-colors"
            >
              <i className="fas fa-redo mr-2"></i> Reiniciar
            </button>
          </div>
        </div>
      </footer>

      <GameOverModal
        show={gameState.showGameOver}
        session={gameState.session}
        onPlayAgain={restartGame}
        onClose={() => setGameState(prev => ({ ...prev, showGameOver: false }))}
      />

      <PauseModal
        show={gameState.isPaused}
        onResume={togglePause}
        onRestart={restartGame}
        onClose={() => setGameState(prev => ({ ...prev, isPaused: false }))}
      />
    </div>
  );
}
