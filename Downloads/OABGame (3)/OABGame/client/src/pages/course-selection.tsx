import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Scale, 
  Building, 
  Users, 
  Shield, 
  Gavel,
  User,
  LogOut,
  ArrowRight,
  Target,
  Trophy,
  Heart,
  Timer
} from "lucide-react";

interface CourseSelectionProps {
  user: any;
  onStartGame: (challengeType: string, category?: string) => void;
  onLogout: () => void;
  onBack: () => void;
}

interface CategoryCount {
  total: number;
  oab: number;
  concursos: number;
}

export default function CourseSelection({ user, onStartGame, onLogout, onBack }: CourseSelectionProps) {
  const [selectedChallengeType, setSelectedChallengeType] = useState<"OAB_1_FASE" | "CONCURSOS_MPSP">("OAB_1_FASE");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Lista de categorias baseada nos dados reais do banco
  const availableCategories = [
    "Direito Administrativo",
    "Direito Civil", 
    "Direito Constitucional",
    "Direito do Trabalho",
    "Direito Empresarial",
    "Direito Geral",
    "Direito Penal",
    "Direito Processual",
    "Ética Profissional"
  ];

  // Contadores baseados nos dados reais do banco
  const categoryCountsData: Record<string, CategoryCount> = {
    "Direito Administrativo": { total: 131, oab: 50, concursos: 81 },
    "Direito Civil": { total: 50, oab: 50, concursos: 0 },
    "Direito Constitucional": { total: 50, oab: 50, concursos: 0 },
    "Direito do Trabalho": { total: 50, oab: 50, concursos: 0 },
    "Direito Empresarial": { total: 50, oab: 50, concursos: 0 },
    "Direito Geral": { total: 50, oab: 50, concursos: 0 },
    "Direito Penal": { total: 50, oab: 50, concursos: 0 },
    "Direito Processual": { total: 50, oab: 50, concursos: 0 },
    "Ética Profissional": { total: 50, oab: 50, concursos: 0 }
  };

  // Ícones para as categorias
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      "Direito Civil": <Users className="w-6 h-6" />,
      "Direito Penal": <Gavel className="w-6 h-6" />,
      "Direito Constitucional": <Shield className="w-6 h-6" />,
      "Direito Administrativo": <Building className="w-6 h-6" />,
      "Ética Profissional": <Scale className="w-6 h-6" />,
      "Direito Processual": <BookOpen className="w-6 h-6" />,
      "Direito do Trabalho": <Users className="w-6 h-6" />,
      "Direito Empresarial": <Building className="w-6 h-6" />,
      "Direito Geral": <Target className="w-6 h-6" />,
    };
    return icons[category] || <BookOpen className="w-6 h-6" />;
  };

  // Filtrar categorias por tipo de desafio
  const getFilteredCategories = () => {
    return availableCategories.filter(category => {
      const count = categoryCountsData[category];
      if (!count) return false;
      
      if (selectedChallengeType === "OAB_1_FASE") {
        return count.oab > 0;
      } else {
        return count.concursos > 0;
      }
    });
  };

  const handleStartGame = () => {
    onStartGame(selectedChallengeType, selectedCategory || undefined);
  };

  const getQuestionCount = (category: string) => {
    const count = categoryCountsData[category];
    if (!count) return 0;
    
    return selectedChallengeType === "OAB_1_FASE" ? count.oab : count.concursos;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-700 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-gray-100">Seleção de Curso</h1>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">Escolha sua área de estudo</p>
                    <span className="text-xs text-gray-400">Powered by BIPETech</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-700/60 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 text-gray-300" />
                <span className="text-gray-100 font-medium">{user?.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/admin'}
                    className="bg-gray-700/60 border-gray-600 text-gray-100 hover:bg-gray-600"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="bg-gray-700/60 border-gray-600 text-gray-100 hover:bg-gray-600"
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
      <main className="flex-1 p-4 pt-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Voltar */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-gray-700/60 border-gray-600 text-gray-100 hover:bg-gray-600"
            >
              ← Voltar para Preparação
            </Button>
          </div>

          {/* Seleção de Tipo de Desafio */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">1. Escolha o Tipo de Prova</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all duration-200 bg-gray-800/60 border-gray-600 ${
                  selectedChallengeType === "OAB_1_FASE" 
                    ? "ring-2 ring-blue-500 bg-gray-700/50" 
                    : "hover:bg-gray-700/30"
                }`}
                onClick={() => {
                  setSelectedChallengeType("OAB_1_FASE");
                  setSelectedCategory(null); // Reset category when changing challenge type
                }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-700 p-2 rounded-lg">
                      <Scale className="w-6 h-6 text-gray-200" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-100">OAB 1ª Fase</CardTitle>
                      <CardDescription className="text-gray-400">
                        Exame da Ordem dos Advogados do Brasil
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>450 questões disponíveis</span>
                    {selectedChallengeType === "OAB_1_FASE" && (
                      <Badge className="bg-gray-600 text-gray-100">Selecionado</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all duration-200 bg-gray-800/60 border-gray-600 ${
                  selectedChallengeType === "CONCURSOS_MPSP" 
                    ? "ring-2 ring-green-500 bg-gray-700/50" 
                    : "hover:bg-gray-700/30"
                }`}
                onClick={() => {
                  setSelectedChallengeType("CONCURSOS_MPSP");
                  setSelectedCategory(null); // Reset category when changing challenge type
                }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-700 p-2 rounded-lg">
                      <Building className="w-6 h-6 text-gray-200" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-100">Concursos MPSP</CardTitle>
                      <CardDescription className="text-gray-400">
                        Ministério Público de São Paulo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>81 questões disponíveis</span>
                    {selectedChallengeType === "CONCURSOS_MPSP" && (
                      <Badge className="bg-gray-600 text-gray-100">Selecionado</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Seleção de Categoria */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">2. Escolha a Disciplina (Opcional)</h2>
            <p className="text-gray-300 mb-4">
              Selecione uma disciplina específica ou deixe em branco para questões mistas
            </p>

            {/* Opção "Todas as Disciplinas" */}
            <div className="mb-4">
              <Card 
                className={`cursor-pointer transition-all duration-200 bg-gray-800/60 border-gray-600 ${
                  selectedCategory === null
                    ? "ring-2 ring-blue-500 bg-gray-700/50" 
                    : "hover:bg-gray-700/30"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-600 p-2 rounded-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-100">Todas as Disciplinas</CardTitle>
                        <CardDescription className="text-gray-400">
                          Questões mistas de todas as áreas
                        </CardDescription>
                      </div>
                    </div>
                    {selectedCategory === null && (
                      <Badge className="bg-gray-600 text-gray-100">Selecionado</Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Grid de Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredCategories().map((category) => {
                const questionCount = getQuestionCount(category);
                
                return (
                  <Card 
                    key={category}
                    className={`cursor-pointer transition-all duration-200 bg-gray-800/60 border-gray-600 ${
                      selectedCategory === category 
                        ? "ring-2 ring-blue-500 bg-gray-700/50" 
                        : "hover:bg-gray-700/30"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-600 p-2 rounded-lg text-white">
                          {getCategoryIcon(category)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-gray-100 text-sm">
                            {category}
                          </CardTitle>
                          <CardDescription className="text-gray-400 text-xs">
                            {questionCount} questões
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {selectedChallengeType === "OAB_1_FASE" ? "OAB" : "Concursos"}
                        </div>
                        {selectedCategory === category && (
                          <Badge className="bg-gray-600 text-gray-100 text-xs">Selecionado</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Resumo da Seleção */}
          <div className="mb-8">
            <Card className="bg-gray-800/60 border-gray-600">
              <CardHeader>
                <CardTitle className="text-gray-100 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gray-300" />
                  Resumo da Seleção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-600">
                    <Target className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-100 font-medium text-sm">Tipo de Prova</div>
                    <div className="text-gray-400 text-xs">
                      {selectedChallengeType === "OAB_1_FASE" ? "OAB 1ª Fase" : "Concursos MPSP"}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-600">
                    <BookOpen className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-100 font-medium text-sm">Disciplina</div>
                    <div className="text-gray-400 text-xs">
                      {selectedCategory || "Todas as disciplinas"}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-600">
                    <Heart className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-100 font-medium text-sm">Vidas</div>
                    <div className="text-gray-400 text-xs">3 vidas</div>
                  </div>
                  
                  <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-600">
                    <Timer className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-100 font-medium text-sm">Tempo</div>
                    <div className="text-gray-400 text-xs">60 segundos/questão</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão Iniciar */}
          <div className="text-center">
            <Button
              onClick={handleStartGame}
              size="lg"
              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-100 px-8 py-6 text-lg border border-gray-600"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Iniciar Jogo
              <span className="text-sm ml-2 opacity-80">
                (20 questões)
              </span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}