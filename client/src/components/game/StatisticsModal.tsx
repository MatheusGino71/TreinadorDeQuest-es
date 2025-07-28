import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, BarChart3, Clock, Target, TrendingUp } from "lucide-react";

interface UserAnswer {
  id: string;
  questionId: string;
  userAnswerIndex: number;
  correctAnswerIndex: number;
  isCorrect: boolean;
  timeSpent: number;
  challengeType: string;
  category: string;
  difficulty: number;
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  category: string;
  difficulty: number;
  explanation?: string;
}

interface StatisticsModalProps {
  show: boolean;
  sessionId: string | null;
  onClose: () => void;
}

export default function StatisticsModal({ show, sessionId, onClose }: StatisticsModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<UserAnswer | null>(null);

  // Buscar respostas da sessão
  const { data: sessionAnswers = [] } = useQuery<UserAnswer[]>({
    queryKey: [`/api/session/${sessionId}/answers`],
    enabled: show && !!sessionId,
  });

  // Buscar questões para obter textos e opções
  const { data: allQuestions = [] } = useQuery<Question[]>({
    queryKey: ['/api/questions/all'],
    enabled: show && sessionAnswers.length > 0,
  });

  // Criar mapa de questões para lookup rápido
  const questionsMap = new Map(allQuestions.map((q) => [q.id, q]));

  // Combinar respostas com dados das questões
  const answersWithQuestions = sessionAnswers.map((answer) => ({
    ...answer,
    question: questionsMap.get(answer.questionId)
  })).filter((item) => item.question);

  const correctAnswers = answersWithQuestions.filter((a) => a.isCorrect);
  const incorrectAnswers = answersWithQuestions.filter((a) => !a.isCorrect);
  const totalQuestions = answersWithQuestions.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers.length / totalQuestions) * 100) : 0;
  const averageTime = totalQuestions > 0 ? Math.round(answersWithQuestions.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions) : 0;

  // Estatísticas por categoria
  const categoryStats = answersWithQuestions.reduce((acc, answer) => {
    const category = answer.category;
    if (!acc[category]) {
      acc[category] = { total: 0, correct: 0 };
    }
    acc[category].total++;
    if (answer.isCorrect) acc[category].correct++;
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  if (!show) return null;

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Estatísticas da Sessão</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Acertos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{correctAnswers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Erros</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{incorrectAnswers.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span>Precisão</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas por Categoria */}
          {Object.keys(categoryStats).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Performance por Categoria</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryStats).map(([category, stats]) => {
                    const percentage = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="font-medium">{category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {stats.correct}/{stats.total}
                          </span>
                          <Badge 
                            variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"}
                          >
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Questões Incorretas */}
          {incorrectAnswers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span>Questões Erradas ({incorrectAnswers.length})</span>
                </CardTitle>
                <CardDescription>
                  Revise estas questões para melhorar seu desempenho
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {incorrectAnswers.map((answer, index) => (
                  <div key={answer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">Questão {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{answer.category}</Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {answer.timeSpent}s
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700">{answer.question?.text}</p>
                    
                    <div className="space-y-2">
                      {answer.question?.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded text-sm ${
                            optionIndex === answer.correctAnswerIndex
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : optionIndex === answer.userAnswerIndex
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{String.fromCharCode(65 + optionIndex)}) {option}</span>
                            {optionIndex === answer.correctAnswerIndex && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {optionIndex === answer.userAnswerIndex && optionIndex !== answer.correctAnswerIndex && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {answer.question?.explanation && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Explicação:</p>
                        <p className="text-sm text-blue-700">{answer.question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Lista de Questões Corretas */}
          {correctAnswers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Questões Certas ({correctAnswers.length})</span>
                </CardTitle>
                <CardDescription>
                  Parabéns! Você acertou estas questões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {correctAnswers.map((answer, index) => (
                  <div key={answer.id} className="border border-green-200 rounded-lg p-3 bg-green-50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">Questão {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{answer.category}</Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {answer.timeSpent}s
                        </Badge>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{answer.question?.text}</p>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>Resposta correta:</strong> {String.fromCharCode(65 + answer.correctAnswerIndex)}) {answer.question?.options[answer.correctAnswerIndex]}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}