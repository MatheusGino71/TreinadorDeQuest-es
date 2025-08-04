import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Game from "@/pages/game";
import LoginSimple from "@/pages/login-simple";
import Preparation from "@/pages/preparation";
import CourseSelection from "@/pages/course-selection";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { type User } from "@shared/schema";

function Router() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<'preparation' | 'course-selection' | 'playing'>('preparation');

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('game-oab-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('game-oab-user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('game-oab-user', JSON.stringify(userData));
    setGameState('preparation'); // Reset to preparation after login
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('game-oab-user');
    setGameState('preparation'); // Reset game state
  };

  const handleShowCourseSelection = () => {
    setGameState('course-selection');
  };

  const handleStartGame = (challengeType: string, category?: string) => {
    // Store challenge type and category for the game session
    localStorage.setItem('game-challenge-type', challengeType);
    if (category) {
      localStorage.setItem('game-category', category);
    } else {
      localStorage.removeItem('game-category');
    }
    setGameState('playing');
  };

  const handleReturnToPreparation = () => {
    setGameState('preparation');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginSimple onLoginSuccess={handleLoginSuccess} />;
  }

  // Check if user is admin and on admin route
  const isAdminRoute = window.location.pathname === '/admin';
  if (user.role === 'admin' && isAdminRoute) {
    return <AdminDashboard />;
  }

  if (gameState === 'preparation') {
    return (
      <Preparation 
        user={user} 
        onShowCourseSelection={handleShowCourseSelection}
        onLogout={handleLogout} 
      />
    );
  }

  if (gameState === 'course-selection') {
    return (
      <CourseSelection
        user={user}
        onStartGame={handleStartGame}
        onLogout={handleLogout}
        onBack={() => setGameState('preparation')}
      />
    );
  }

  return (
    <Switch>
      <Route path="/" component={() => <Game user={user} onLogout={handleReturnToPreparation} />} />
      <Route path="/admin" component={() => user.role === 'admin' ? <AdminDashboard /> : <NotFound />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="game-container">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
