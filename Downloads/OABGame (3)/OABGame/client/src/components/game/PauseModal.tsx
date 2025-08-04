import { Play, RotateCcw, LogOut, Pause } from "lucide-react";

interface PauseModalProps {
  show: boolean;
  onResume: () => void;
  onRestart: () => void;
  onClose: () => void;
}

export default function PauseModal({ show, onResume, onRestart, onClose }: PauseModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-game-surface rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <Pause className="w-12 h-12 text-game-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-game-text mb-2">Jogo Pausado</h2>
          <p className="text-game-text-secondary">Que tal uma pausa para revisar?</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full bg-game-blue hover:bg-blue-600 text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Continuar</span>
          </button>
          <button
            onClick={onRestart}
            className="w-full bg-game-surface hover:bg-gray-600 text-game-text rounded-xl py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar</span>
          </button>
          <button
            onClick={onClose}
            className="w-full bg-game-red hover:bg-red-600 text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Jogo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
