interface AnswerButtonsProps {
  options: string[];
  eliminatedOptions?: number[];
  onAnswer: (answerIndex: number) => void;
  disabled: boolean;
}

export default function AnswerButtons({ options, eliminatedOptions = [], onAnswer, disabled }: AnswerButtonsProps) {
  const buttonColors = [
    "bg-game-blue hover:bg-blue-600",
    "bg-game-green hover:bg-green-600", 
    "bg-game-yellow hover:bg-yellow-600",
    "bg-game-red hover:bg-red-600"
  ];

  if (!options || options.length === 0) {
    return <div className="mb-8">Carregando opções...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {options.map((option, index) => {
        const isEliminated = eliminatedOptions.includes(index);
        return (
          <button
            key={index}
            onClick={() => !isEliminated && onAnswer(index)}
            disabled={disabled || isEliminated}
            className={`answer-btn group ${
              isEliminated 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' 
                : buttonColors[index]
            } text-white rounded-xl p-6 text-lg font-semibold shadow-lg game-button disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-start space-x-4">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm font-bold ${
                isEliminated 
                  ? 'bg-gray-500 bg-opacity-50' 
                  : 'bg-white bg-opacity-20 group-hover:bg-opacity-30'
              }`}>
                {isEliminated ? '✗' : index + 1}
              </div>
              <span className={`text-left flex-1 ${isEliminated ? 'line-through' : ''}`}>
                {option}
              </span>
            </div>
            <div className="mt-2 text-xs opacity-75">
              {isEliminated ? 'Eliminada pelo 50/50' : `Pressione ${index + 1} ou clique aqui`}
            </div>
          </button>
        );
      })}
    </div>
  );
}
