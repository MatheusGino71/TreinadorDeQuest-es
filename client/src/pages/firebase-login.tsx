import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Eye, EyeOff, User, Mail, Phone } from "lucide-react";

export default function FirebaseLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const [, setLocation] = useLocation();

  const { login, register, loading, isAuthenticated } = useFirebaseAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/firebase-game');
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData);
    }
    
    // Redirect to Firebase game integration on successful login/register
    if (result?.success) {
      window.location.href = '/firebase-game';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Treinador de Questões</h1>
          <p className="text-gray-400">Sistema Jurídico de Estudos</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-4">
            <span>Powered by</span>
            <span className="font-semibold text-blue-400">BIPETech</span>
          </div>
        </div>

        {/* Login/Register Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              {isLogin 
                ? "Entre com suas credenciais para acessar o sistema" 
                : "Crie sua conta para começar a estudar"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Telefone (Opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Carregando..." : (isLogin ? "Entrar" : "Criar Conta")}
              </Button>
            </form>

            <Separator className="bg-gray-600" />

            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 text-sm"
                disabled={loading}
              >
                {isLogin 
                  ? "Não tem uma conta? Crie uma aqui" 
                  : "Já tem uma conta? Entre aqui"
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Treinador de Questões - Todos os direitos reservados</p>
          <div className="mt-2">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Voltar ao Login Tradicional
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}