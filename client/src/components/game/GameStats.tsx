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

interface GameStatsProps {
  session: GameSession;
}

export default function GameStats({ session }: GameStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div className="bg-game-surface rounded-xl p-4">
        <div className="text-2xl font-bold text-game-green">{session.correctAnswers}</div>
        <div className="text-sm text-game-text-secondary">Acertos</div>
      </div>
      <div className="bg-game-surface rounded-xl p-4">
        <div className="text-2xl font-bold text-game-red">{session.incorrectAnswers}</div>
        <div className="text-sm text-game-text-secondary">Erros</div>
      </div>
      <div className="bg-game-surface rounded-xl p-4">
        <div className="text-2xl font-bold text-game-yellow">{session.currentStreak}</div>
        <div className="text-sm text-game-text-secondary">Sequência</div>
      </div>
    </div>
  );
}
