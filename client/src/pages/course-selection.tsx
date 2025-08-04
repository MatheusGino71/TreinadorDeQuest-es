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

  // Buscar categorias disponíveis
  const { data: categories } = useQuery<string[]>({
    queryKey: ["/api/questions/categories"],
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
  });

  // Buscar contagem por categoria
  const { data: categoryCounts } = useQuery<Record<string, CategoryCount>>({
    queryKey: ["/api/questions/count-by-category"],
    staleTime: 10 * 60 * 1000,
  });

  // Ícones para as categorias
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      "Direito Civil": <Users className="w-6 h-6" />,
      "Direito Penal": <Gavel className="w-6 h-6" />,
      "Direito Constitucional": <Shield className="w-6 h-6" />,
      "Direito Administrativo": <Building className="w-6 h-6" />,
      "Ética Profissional": <Scale className="w-6 h-6" />,
      "Direito Processual Civil": <BookOpen className="w-6 h-6" />,
      "Direito do Trabalho": <Users className="w-6 h-6" />,
      "Direito Empresarial": <Building className="w-6 h-6" />,
      "Direito Tributário": <Scale className="w-6 h-6" />,
    };
    return icons[category] || <BookOpen className="w-6 h-6" />;
  };

  // Filtrar categorias por tipo de desafio
  const getFilteredCategories = () => {
    if (!categories || !categoryCounts) return [];
    
    return categories.filter(category => {
      const count = categoryCounts[category];
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
    const count = categoryCounts?.[category];
    if (!count) return 0;
    
    return selectedChallengeType === "OAB_1_FASE" ? count.oab : count.concursos;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-white">Seleção de Curso</h1>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-200">Escolha sua área de estudo</p>
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
      <main className="flex-1 p-4 pt-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Voltar */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              ← Voltar para Preparação
            </Button>
          </div>

          {/* Seleção de Tipo de Desafio */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Escolha o Tipo de Prova</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedChallengeType === "OAB_1_FASE" 
                    ? "ring-2 ring-blue-500 bg-blue-50/10" 
                    : "hover:bg-white/5"
                }`}
                onClick={() => {
                  setSelectedChallengeType("OAB_1_FASE");
                  setSelectedCategory(null); // Reset category when changing challenge type
                }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Scale className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">OAB 1ª Fase</CardTitle>
                      <CardDescription className="text-blue-200">
                        Exame da Ordem dos Advogados do Brasil
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-blue-200">
                    <span>450 questões disponíveis</span>
                    {selectedChallengeType === "OAB_1_FASE" && (
                      <Badge className="bg-blue-600">Selecionado</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedChallengeType === "CONCURSOS_MPSP" 
                    ? "ring-2 ring-green-500 bg-green-50/10" 
                    : "hover:bg-white/5"
                }`}
                onClick={() => {
                  setSelectedChallengeType("CONCURSOS_MPSP");
                  setSelectedCategory(null); // Reset category when changing challenge type
                }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Concursos MPSP</CardTitle>
                      <CardDescription className="text-blue-200">
                        Ministério Público de São Paulo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-blue-200">
                    <span>81 questões disponíveis</span>
                    {selectedChallengeType === "CONCURSOS_MPSP" && (
                      <Badge className="bg-green-600">Selecionado</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Seleção de Categoria */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Escolha a Disciplina (Opcional)</h2>
            <p className="text-blue-200 mb-4">
              Selecione uma disciplina específica ou deixe em branco para questões mistas
            </p>

            {/* Opção "Todas as Disciplinas" */}
            <div className="mb-4">
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCategory === null
                    ? "ring-2 ring-purple-500 bg-purple-50/10" 
                    : "hover:bg-white/5"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 p-2 rounded-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Todas as Disciplinas</CardTitle>
                        <CardDescription className="text-blue-200">
                          Questões mistas de todas as áreas
                        </CardDescription>
                      </div>
                    </div>
                    {selectedCategory === null && (
                      <Badge className="bg-purple-600">Selecionado</Badge>
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
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedCategory === category 
                        ? "ring-2 ring-blue-500 bg-blue-50/10" 
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                          {getCategoryIcon(category)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-white text-sm">
                            {category}
                          </CardTitle>
                          <CardDescription className="text-blue-200 text-xs">
                            {questionCount} questões
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-blue-300">
                          {selectedChallengeType === "OAB_1_FASE" ? "OAB" : "Concursos"}
                        </div>
                        {selectedCategory === category && (
                          <Badge className="bg-blue-600 text-xs">Selecionado</Badge>
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
            <Card className="bg-white/5 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Resumo da Seleção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-medium text-sm">Tipo de Prova</div>
                    <div className="text-blue-200 text-xs">
                      {selectedChallengeType === "OAB_1_FASE" ? "OAB 1ª Fase" : "Concursos MPSP"}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <BookOpen className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-white font-medium text-sm">Disciplina</div>
                    <div className="text-blue-200 text-xs">
                      {selectedCategory || "Todas as disciplinas"}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <div className="text-white font-medium text-sm">Vidas</div>
                    <div className="text-blue-200 text-xs">3 vidas</div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <Timer className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-white font-medium text-sm">Tempo</div>
                    <div className="text-blue-200 text-xs">60 segundos/questão</div>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
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