import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Zap, Eye, SkipForward, Timer, Trophy, Target, Flame } from "lucide-react";
import { type User } from "@shared/schema";
import { sampleQuestions, getQuestionsByCategory, shuffleQuestions, type Question } from "@/data/sample-questions";

interface GameProps {
  user: User;
  onLogout: () => void;
}

interface GameState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  timeRemaining: number;
  isGameOver: boolean;
  showGameOver: boolean;
  showStatistics: boolean;
  correctAnswers: number;
  totalQuestions: number;
  usedPowerUps: {
    hint?: boolean;
    eliminate?: boolean;
    skip?: boolean;
  };
  eliminatedOptions: number[];
  streak: number;
  maxStreak: number;
}

const GAME_DURATION = 60; // seconds per question
const POINTS_PER_CORRECT = 100;
const STREAK_BONUS = 50;

export default function GameFirebase({ user, onLogout }: GameProps) {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    timeRemaining: GAME_DURATION,
    isGameOver: false,
    showGameOver: false,
    showStatistics: false,
    correctAnswers: 0,
    totalQuestions: 0,
    usedPowerUps: {},
    eliminatedOptions: [],
    streak: 0,
    maxStreak: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game
  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.timeRemaining > 0 && !gameState.isGameOver) {
      timerRef.current = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
    } else if (gameState.timeRemaining === 0 && !gameState.isGameOver) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState.timeRemaining, gameState.isGameOver]);

  const startNewGame = () => {
    const challengeType = localStorage.getItem('game-challenge-type') || 'OAB_1_FASE';
    const category = localStorage.getItem('game-category');
    
    let questions = getQuestionsByCategory(challengeType === 'OAB_1_FASE' ? 'OAB_1_FASE' : 'CONCURSOS');
    questions = shuffleQuestions(questions).slice(0, 10); // Limit to 10 questions

    setGameState({
      questions,
      currentQuestionIndex: 0,
      score: 0,
      timeRemaining: GAME_DURATION,
      isGameOver: false,
      showGameOver: false,
      showStatistics: false,
      correctAnswers: 0,
      totalQuestions: questions.length,
      usedPowerUps: {},
      eliminatedOptions: [],
      streak: 0,
      maxStreak: 0,
    });

    toast({
      title: "Jogo iniciado!",
      description: `Boa sorte com as questões ${challengeType === 'OAB_1_FASE' ? 'da OAB 1ª Fase' : 'de Concursos'}!`,
    });
  };

  const handleTimeUp = () => {
    setGameState(prev => ({
      ...prev,
      streak: 0, // Reset streak on timeout
    }));
    nextQuestion();
  };

  const handleAnswer = (selectedOption: number) => {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    let points = 0;
    let newStreak = gameState.streak;
    let newMaxStreak = gameState.maxStreak;

    if (isCorrect) {
      newStreak += 1;
      newMaxStreak = Math.max(newMaxStreak, newStreak);
      points = POINTS_PER_CORRECT + (newStreak > 1 ? STREAK_BONUS * (newStreak - 1) : 0);
      
      toast({
        title: "Correto! 🎉",
        description: `+${points} pontos${newStreak > 1 ? ` (Sequência: ${newStreak})` : ''}`,
      });
    } else {
      newStreak = 0;
      toast({
        title: "Incorreto 😞",
        description: currentQuestion.explanation || "Continue tentando!",
        variant: "destructive",
      });
    }

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      streak: newStreak,
      maxStreak: newMaxStreak,
      eliminatedOptions: [], // Reset eliminated options
      usedPowerUps: {}, // Reset power-ups for next question
    }));

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    const nextIndex = gameState.currentQuestionIndex + 1;
    
    if (nextIndex >= gameState.questions.length) {
      // Game over
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        showGameOver: true,
      }));
    } else {
      // Next question
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        timeRemaining: GAME_DURATION,
      }));
    }
  };

  const usePowerUp = (type: 'hint' | 'eliminate' | 'skip') => {
    if (gameState.usedPowerUps[type]) return;

    switch (type) {
      case 'hint':
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        toast({
          title: "Dica 💡",
          description: currentQuestion.explanation || "Pense cuidadosamente sobre os conceitos envolvidos.",
        });
        break;
      
      case 'eliminate':
        const correctAnswer = gameState.questions[gameState.currentQuestionIndex].correctAnswer;
        const availableOptions = [0, 1, 2, 3].filter(i => i !== correctAnswer);
        const toEliminate = availableOptions.slice(0, 2); // Eliminate 2 wrong options
        setGameState(prev => ({
          ...prev,
          eliminatedOptions: toEliminate,
        }));
        toast({
          title: "Opções eliminadas! ⚡",
          description: "Duas opções incorretas foram removidas.",
        });
        break;
      
      case 'skip':
        toast({
          title: "Questão pulada! ⏭️",
          description: "Passando para a próxima questão.",
        });
        nextQuestion();
        break;
    }

    setGameState(prev => ({
      ...prev,
      usedPowerUps: { ...prev.usedPowerUps, [type]: true },
    }));
  };

  const restartGame = () => {
    startNewGame();
  };

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  if (gameState.showGameOver) {
    const accuracy = gameState.totalQuestions > 0 ? (gameState.correctAnswers / gameState.totalQuestions) * 100 : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Jogo Finalizado!</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
                <div className="text-sm text-gray-600">Pontuação Total</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {gameState.correctAnswers}/{gameState.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{accuracy.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Precisão</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{gameState.maxStreak}</div>
                <div className="text-sm text-gray-600">Maior Sequência</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={restartGame} className="bg-blue-600 hover:bg-blue-700">
                Jogar Novamente
              </Button>
              <Button onClick={onLogout} variant={"outline"}>
                Voltar ao Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando questões...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onLogout}
          variant={"outline"}
          className="text-white border-white hover:bg-white hover:text-blue-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <span className={`font-bold ${gameState.timeRemaining <= 10 ? 'text-red-300' : ''}`}>
              {gameState.timeRemaining}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <span className="font-bold">{gameState.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            <span className="font-bold">{gameState.streak}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-white text-sm mb-2">
          <span>Questão {gameState.currentQuestionIndex + 1} de {gameState.totalQuestions}</span>
          <span>{gameState.correctAnswers} acertos</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Power-ups */}
      <div className="flex justify-center gap-2 mb-6">
        <Button
          onClick={() => usePowerUp('hint')}
          disabled={gameState.usedPowerUps.hint}
          variant={"outline"}
          size={"sm"}
          className="text-white border-white hover:bg-white hover:text-blue-900"
        >
          <Eye className="h-4 w-4 mr-1" />
          Dica
        </Button>
        <Button
          onClick={() => usePowerUp('eliminate')}
          disabled={gameState.usedPowerUps.eliminate}
          variant={"outline"}
          size={"sm"}
          className="text-white border-white hover:bg-white hover:text-blue-900"
        >
          <Zap className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
        <Button
          onClick={() => usePowerUp('skip')}
          disabled={gameState.usedPowerUps.skip}
          variant={"outline"}
          size={"sm"}
          className="text-white border-white hover:bg-white hover:text-blue-900"
        >
          <SkipForward className="h-4 w-4 mr-1" />
          Pular
        </Button>
      </div>

      {/* Question */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isEliminated = gameState.eliminatedOptions.includes(index);
              
              return (
                <Button
                  key={index}
                  onClick={() => !isEliminated && handleAnswer(index)}
                  disabled={isEliminated}
                  variant={"outline"}
                  className={`w-full text-left p-4 h-auto whitespace-normal ${
                    isEliminated 
                      ? 'opacity-30 cursor-not-allowed bg-gray-100' 
                      : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-blue-600 min-w-0">
                      {String.fromCharCode(65 + index)})
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
