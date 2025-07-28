import { Heart, Gamepad, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface GameHeaderProps {
  session: GameSession;
  user: any;
  onPause: () => void;
  onLogout: () => void;
}

export default function GameHeader({ session, user, onPause, onLogout }: GameHeaderProps) {
  return (
    <header className="bg-game-surface shadow-lg border-b-2 border-game-blue">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-game-blue p-2 rounded-lg">
              <Gamepad className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-game-text">GAME OAB</h1>
              <p className="text-sm text-game-text-secondary">Processo Civil</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-lg">
              <User className="w-4 h-4 text-game-text-secondary" />
              <span className="text-sm text-game-text">{user?.name}</span>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-game-text-secondary">Pontuação</div>
              <div className="text-xl font-bold text-game-yellow">
                {session.score.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-game-text-secondary">Nível</div>
              <div className="text-xl font-bold text-game-blue">{session.level}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-game-text-secondary">Vidas</div>
              <div className="flex space-x-1">
                {Array(3).fill(0).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 ${
                      i < session.lives 
                        ? 'text-game-red fill-current' 
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="bg-white/10 border-white/20 text-game-text hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
