import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  UserPlus, 
  Trash2, 
  Edit,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalSessions: number;
  activeUsers: number;
  questionsOAB: number;
  questionsConcursos: number;
  avgSessionScore: number;
  topCategories: Array<{category: string, count: number}>;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  // Buscar estatísticas administrativas
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  // Buscar todos os usuários
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  // Buscar sessões recentes
  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/admin/sessions/recent'],
    retry: false,
  });

  // Mutation para exportar questões
  const exportQuestionsMutation = useMutation({
    mutationFn: async ({ category, challengeType, format }: { category?: string; challengeType?: string; format: string }) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (challengeType) params.append('challengeType', challengeType);
      params.append('format', format);
      
      const response = await fetch(`/api/admin/export/questions?${params}`, {
        headers: {
          'Authorization': `Bearer admin@sistema.com`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao exportar questões');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questoes_${category || challengeType || 'todas'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Questões exportadas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao exportar questões",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: string; role?: string; isActive?: boolean }) => {
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Erro ao atualizar usuário');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar usuário',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar usuário');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover usuário',
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Treinador de Questões - Sistema de Gestão</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Admin Dashboard
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Questões
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeUsers || 0} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalQuestions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.questionsOAB || 0} OAB + {stats?.questionsConcursos || 0} Concursos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessões de Jogo</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Pontuação média: {stats?.avgSessionScore || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorias Populares</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {stats?.topCategories?.slice(0, 3).map((cat, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate">{cat.category}</span>
                        <span className="font-medium">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSessions?.slice(0, 10).map((session: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b">
                        <div>
                          <p className="font-medium">{session.userName}</p>
                          <p className="text-sm text-gray-600">
                            {session.challengeType} - Pontuação: {session.score}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatDate(session.createdAt)}</p>
                          <Badge variant={session.isGameOver ? 'destructive' : 'default'}>
                            {session.isGameOver ? 'Finalizada' : 'Em andamento'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciamento de Usuários</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Novo Usuário
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                        </DialogHeader>
                        {/* Form for new user */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" placeholder="Nome completo" />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="email@exemplo.com" />
                          </div>
                          <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" placeholder="(11) 99999-9999" />
                          </div>
                          <div>
                            <Label htmlFor="role">Função</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a função" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                              Cancelar
                            </Button>
                            <Button>Criar Usuário</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={(checked) => 
                                  updateUserMutation.mutate({ id: user.id, isActive: checked })
                                }
                              />
                              <span className="text-sm">
                                {user.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                disabled={user.role === 'admin'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Questões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Questões OAB</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats?.questionsOAB || 0}
                      </div>
                      <p className="text-sm text-gray-600">Questões da 1ª Fase</p>
                      <Button className="mt-4 w-full" variant="outline">
                        Gerenciar OAB
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Questões Concursos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {stats?.questionsConcursos || 0}
                      </div>
                      <p className="text-sm text-gray-600">Questões MPSP</p>
                      <Button className="mt-4 w-full" variant="outline">
                        Gerenciar Concursos
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Exportar Questões</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => exportQuestionsMutation.mutate({ format: 'json' })}
                          disabled={exportQuestionsMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Todas as Questões (JSON)
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => exportQuestionsMutation.mutate({ challengeType: 'OAB_1_FASE', format: 'json' })}
                          disabled={exportQuestionsMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Somente OAB (JSON)
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => exportQuestionsMutation.mutate({ challengeType: 'CONCURSOS_MPSP', format: 'json' })}
                          disabled={exportQuestionsMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Somente Concursos (JSON)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Adicionar Questões</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button className="w-full">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Nova Questão
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Importar Excel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Configurações Gerais</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Registros de novos usuários</Label>
                          <p className="text-sm text-gray-600">Permitir que novos usuários se registrem</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Modo manutenção</Label>
                          <p className="text-sm text-gray-600">Desabilitar acesso ao sistema</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Configurações do Jogo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="questionLimit">Questões por sessão</Label>
                        <Input id="questionLimit" type="number" defaultValue="20" />
                      </div>
                      <div>
                        <Label htmlFor="timeLimit">Tempo por questão (segundos)</Label>
                        <Input id="timeLimit" type="number" defaultValue="60" />
                      </div>
                      <div>
                        <Label htmlFor="lives">Número de vidas</Label>
                        <Input id="lives" type="number" defaultValue="3" />
                      </div>
                      <div>
                        <Label htmlFor="powerups">Power-ups por sessão</Label>
                        <Input id="powerups" type="number" defaultValue="3" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>Salvar Configurações</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>© 2025 Treinador de Questões - Painel Administrativo</p>
            <p>Powered by BIPETech</p>
          </div>
        </div>
      </div>
    </div>
  );
}