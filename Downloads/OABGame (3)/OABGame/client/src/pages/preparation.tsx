import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GamepadIcon, 
  Gamepad2, 
  Clock, 
  Heart, 
  Zap, 
  Target, 
  Trophy,
  User,
  LogOut,
  Play,
  BookOpen,
  Timer,
  Award,
  Settings
} from "lucide-react";

interface PreparationProps {
  user: any;
  onShowCourseSelection: () => void;
  onLogout: () => void;
}

export default function Preparation({ user, onShowCourseSelection, onLogout }: PreparationProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedChallengeType, setSelectedChallengeType] = useState<"OAB_1_FASE" | "CONCURSOS_MPSP">("OAB_1_FASE");

  // Fetch questions count dynamically
  const { data: questionsCount } = useQuery({
    queryKey: ["/api/questions/count"],
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  const gameRules = [
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: selectedChallengeType === "OAB_1_FASE" 
        ? `${questionsCount?.OAB_1_FASE || 450} Questões` 
        : `${questionsCount?.CONCURSOS_MPSP || 81} Questões`,
      description: selectedChallengeType === "OAB_1_FASE" 
        ? "Responda questões sobre todas as disciplinas da 1ª Fase" 
        : "Questões específicas para concursos MPSP"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "3 Vidas",
      description: "Você perde uma vida a cada resposta errada"
    },
    {
      icon: <Timer className="w-6 h-6 text-yellow-500" />,
      title: "60 Segundos",
      description: "Tempo limite para responder cada questão"
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      title: "Power-ups",
      description: "Use 50/50, tempo extra ou pular questão"
    }
  ];

  const controls = [
    { key: "1, 2, 3, 4", action: "Selecionar alternativas" },
    { key: "Espaço", action: "Pausar/Continuar jogo" },
    { key: "Q", action: "Usar power-up 50/50" },
    { key: "W", action: "Usar tempo extra" },
    { key: "E", action: "Pular questão" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GamepadIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-white">Treinador de Questões</h1>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-200">Estudo Jurídico Interativo</p>
                    <span className="text-xs text-blue-300">Powered by BIPETech</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 text-blue-200" />
                <span className="text-white font-medium">{user?.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/admin'}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pt-8">
        <div className="max-w-4xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
                <Gamepad2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Prepare-se para o Desafio!
            </h1>
            <p className="text-xl text-blue-200 mb-6">
              Olá, <span className="font-semibold text-white">{user?.name}</span>! 
              Está pronto para testar seus conhecimentos jurídicos?
            </p>

            {/* Challenge Type Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Escolha seu Desafio</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setSelectedChallengeType("OAB_1_FASE")}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 min-w-[250px] ${
                    selectedChallengeType === "OAB_1_FASE"
                      ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                      : "border-white/20 bg-white/5 hover:border-blue-300 hover:bg-blue-500/10"
                  }`}
                >
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-white mb-2">OAB 1ª FASE</h4>
                    <p className="text-blue-200 text-sm mb-3">Primeira Fase - Todas as disciplinas</p>
                    <div className="text-xs text-blue-300">
                      <div>• Direito Constitucional</div>
                      <div>• Direito Civil e Penal</div>
                      <div>• Processo Civil e Trabalho</div>
                      <div>• Direito Empresarial</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedChallengeType("CONCURSOS_MPSP")}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 min-w-[250px] ${
                    selectedChallengeType === "CONCURSOS_MPSP"
                      ? "border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                      : "border-white/20 bg-white/5 hover:border-purple-300 hover:bg-purple-500/10"
                  }`}
                >
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-white mb-2">CONCURSOS</h4>
                    <p className="text-blue-200 text-sm mb-3">Concursos Públicos</p>
                    <div className="text-xs text-blue-300">
                      <div>• MPSP, Defensoria Pública</div>
                      <div>• Tribunais, Procuradorias</div>
                      <div>• ENAM e CNU</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Game Rules Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {gameRules.map((rule, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    {rule.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{rule.title}</h3>
                  <p className="text-sm text-blue-200">{rule.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={onShowCourseSelection}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 text-lg min-w-[200px]"
            >
              <Play className="w-6 h-6 mr-2" />
              Selecionar Curso
            </Button>
            
            <Button
              onClick={() => setShowInstructions(!showInstructions)}
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold py-4 px-8 text-lg min-w-[200px]"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              {showInstructions ? "Ocultar" : "Ver"} Instruções
            </Button>
          </div>

          {/* Instructions Panel */}
          {showInstructions && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Como Jogar
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Instruções detalhadas e controles do jogo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-400" />
                    Objetivo
                  </h4>
                  <p className="text-blue-200 mb-4">
                    Responda o máximo de questões corretamente para obter a maior pontuação possível. 
                    Cada resposta correta aumenta sua pontuação e sequência de acertos.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Sistema de Pontuação
                  </h4>
                  <ul className="text-blue-200 space-y-1">
                    <li>• <strong>Resposta correta:</strong> 100 pontos base</li>
                    <li>• <strong>Bônus por dificuldade:</strong> 20 pontos × nível da questão</li>
                    <li>• <strong>Bônus por tempo:</strong> pontos pelo tempo restante</li>
                    <li>• <strong>Bônus por sequência:</strong> 10 pontos × sequência (a partir de 3 acertos)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-400" />
                    Power-ups Disponíveis
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                      <strong className="text-yellow-400">50/50</strong>
                      <p className="text-sm text-blue-200 mt-1">Elimina 2 alternativas incorretas</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <strong className="text-blue-400">Tempo Extra</strong>
                      <p className="text-sm text-blue-200 mt-1">Adiciona 10 segundos ao cronômetro</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <strong className="text-green-400">Pular</strong>
                      <p className="text-sm text-blue-200 mt-1">Pula a questão sem perder vida</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-400" />
                    Controles do Teclado
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {controls.map((control, index) => (
                      <div key={index} className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <span className="font-mono text-yellow-300">{control.key}</span>
                        <span className="text-blue-200 text-sm">{control.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Preview */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedChallengeType === "OAB_1_FASE" 
                      ? (questionsCount?.OAB_1_FASE || 450)
                      : (questionsCount?.CONCURSOS_MPSP || 81)
                    }
                  </div>
                  <div className="text-sm text-blue-200">Questões</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">3</div>
                  <div className="text-sm text-blue-200">Vidas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">60s</div>
                  <div className="text-sm text-blue-200">Por questão</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">3</div>
                  <div className="text-sm text-blue-200">Power-ups</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}