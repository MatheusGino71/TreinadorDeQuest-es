import { useEffect, useState } from 'react';
import { useAuthContext } from './FirebaseAuthProvider';
import { useLocation } from 'wouter';
import Preparation from '@/pages/preparation';
import CourseSelection from '@/pages/course-selection';
import Game from '@/pages/game';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function FirebaseGameIntegration() {
  const { user, userProfile, loading } = useAuthContext();
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<'preparation' | 'course-selection' | 'playing'>('preparation');
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/firebase');
    }
  }, [user, loading, setLocation]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout realizado",
        description: "Até a próxima!",
      });
      setLocation('/firebase');
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null; // Will redirect to login
  }

  // Convert Firebase user to system user format
  const systemUser = {
    id: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone || '',
    role: userProfile.role,
    createdAt: userProfile.createdAt,
    updatedAt: userProfile.lastLoginAt || userProfile.createdAt,
    lastLoginAt: userProfile.lastLoginAt
  };

  if (gameState === 'preparation') {
    return (
      <Preparation 
        user={systemUser} 
        onShowCourseSelection={handleShowCourseSelection}
        onLogout={handleLogout} 
      />
    );
  }

  if (gameState === 'course-selection') {
    return (
      <CourseSelection
        user={systemUser}
        onStartGame={handleStartGame}
        onLogout={handleLogout}
        onBack={() => setGameState('preparation')}
      />
    );
  }

  return (
    <Game 
      user={systemUser} 
      onLogout={handleReturnToPreparation} 
    />
  );
}