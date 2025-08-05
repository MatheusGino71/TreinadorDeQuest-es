import { HelpCircle, Star } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  difficulty: number;
  category: string;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

export default function QuestionCard({ question, questionNumber }: QuestionCardProps) {
  return (
    <div className="bg-game-surface rounded-2xl shadow-2xl p-8 mb-8 border border-gray-600">
      <div className="text-center">
        <div className="mb-4">
          <span className="bg-game-blue text-white px-3 py-1 rounded-full text-sm font-medium">
            {question.category}
          </span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed text-game-text mb-4">
            {question.text}
          </h2>

          <div className="flex items-center justify-center space-x-2 text-game-text-secondary">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Escolha a alternativa correta:</span>
          </div>
        </div>

        {/* Difficulty Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-game-text-secondary mr-2">Dificuldade:</span>
            {Array(5).fill(0).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < question.difficulty 
                    ? 'text-game-yellow fill-current' 
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
