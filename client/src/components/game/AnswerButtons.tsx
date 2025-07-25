import { Check, X } from "lucide-react";

interface AnswerButtonsProps {
  onAnswer: (answer: boolean) => void;
  disabled: boolean;
}

export default function AnswerButtons({ onAnswer, disabled }: AnswerButtonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <button
        onClick={() => onAnswer(true)}
        disabled={disabled}
        className="answer-btn group bg-game-green hover:bg-green-600 text-white rounded-2xl p-8 text-xl font-bold shadow-lg game-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-white bg-opacity-20 rounded-full p-3 group-hover:bg-opacity-30 transition-all">
            <Check className="w-6 h-6" />
          </div>
          <span className="text-2xl">VERDADEIRO</span>
        </div>
        <div className="mt-2 text-sm opacity-75">Pressione V ou clique aqui</div>
      </button>

      <button
        onClick={() => onAnswer(false)}
        disabled={disabled}
        className="answer-btn group bg-game-red hover:bg-red-600 text-white rounded-2xl p-8 text-xl font-bold shadow-lg game-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center space-x-4">
          <div className="bg-white bg-opacity-20 rounded-full p-3 group-hover:bg-opacity-30 transition-all">
            <X className="w-6 h-6" />
          </div>
          <span className="text-2xl">FALSO</span>
        </div>
        <div className="mt-2 text-sm opacity-75">Pressione F ou clique aqui</div>
      </button>
    </div>
  );
}
