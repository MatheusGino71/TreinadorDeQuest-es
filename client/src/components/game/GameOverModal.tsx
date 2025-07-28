import { Trophy, BarChart, ArrowRight, RotateCcw } from "lucide-react";

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

interface GameOverModalProps {
  show: boolean;
  session: GameSession;
  onPlayAgain: () => void;
  onViewStats: () => void;
  onClose: () => void;
}

export default function GameOverModal({ show, session, onPlayAgain, onViewStats, onClose }: GameOverModalProps) {
  if (!show) return null;

  const accuracy = session.correctAnswers + session.incorrectAnswers > 0 
    ? Math.round((session.correctAnswers / (session.correctAnswers + session.incorrectAnswers)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-game-surface rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <Trophy className="w-16 h-16 text-game-yellow mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-game-text mb-2">Parabéns!</h2>
          <p className="text-game-text-secondary">Você completou esta sessão de estudos</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-game-bg rounded-xl p-4">
            <div className="text-2xl font-bold text-game-yellow">
              {session.score.toLocaleString()}
            </div>
            <div className="text-sm text-game-text-secondary">Pontuação Final</div>
          </div>
          <div className="bg-game-bg rounded-xl p-4">
            <div className="text-2xl font-bold text-game-green">{accuracy}%</div>
            <div className="text-sm text-game-text-secondary">Precisão</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full bg-game-blue hover:bg-blue-600 text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente</span>
          </button>
          <button
            onClick={onViewStats}
            className="w-full bg-game-surface hover:bg-gray-600 text-game-text rounded-xl py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <BarChart className="w-4 h-4" />
            <span>Ver Estatísticas</span>
          </button>
          <button
            onClick={onPlayAgain}
            className="w-full bg-game-green hover:bg-green-600 text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Próximo Nível</span>
          </button>
        </div>
      </div>
    </div>
  );
}
