import { Scissors, Clock, FastForward } from "lucide-react";

interface PowerUpsProps {
  onUsePowerUp: (type: string) => void;
  usedPowerUps: { [key: string]: boolean };
  disabled: boolean;
}

export default function PowerUps({ onUsePowerUp, usedPowerUps, disabled }: PowerUpsProps) {
  const powerUps = [
    {
      id: "fiftyFifty",
      icon: Scissors,
      label: "50/50",
      title: "Eliminar 50% das respostas",
    },
    {
      id: "extraTime",
      icon: Clock,
      label: "+Tempo",
      title: "Tempo extra (+10s)",
    },
    {
      id: "skip",
      icon: FastForward,
      label: "Pular",
      title: "Pular questão",
    },
  ];

  return (
    <div className="flex justify-center space-x-4 mb-6">
      {powerUps.map((powerUp) => {
        const Icon = powerUp.icon;
        const isUsed = usedPowerUps[powerUp.id];
        const isDisabled = disabled || isUsed;

        return (
          <button
            key={powerUp.id}
            onClick={() => !isDisabled && onUsePowerUp(powerUp.id)}
            disabled={isDisabled}
            title={powerUp.title}
            className={`powerup-btn bg-game-surface hover:bg-gray-600 text-game-text rounded-xl p-3 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              !isDisabled ? 'hover:animate-bounce-subtle' : ''
            }`}
          >
            <Icon className="w-5 h-5" />
            <div className="text-xs mt-1">{powerUp.label}</div>
          </button>
        );
      })}
    </div>
  );
}
