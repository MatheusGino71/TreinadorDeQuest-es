import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from './hooks/use-auth';

// Import existing pages
import Game from "@/pages/game";
import LoginSimple from "@/pages/login-simple";
import Preparation from "@/pages/preparation";
import CourseSelection from "@/pages/course-selection";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

// Import Firebase examples
import { AuthExample } from './components/auth/AuthExample';
import { FirestoreExample } from './components/firestore/FirestoreExample';

function FirebaseDemo() {
  const [activeTab, setActiveTab] = useState<'auth' | 'firestore'>('auth');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Firebase Integration Demo</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('auth')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'auth'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Authentication
            </button>
            <button
              onClick={() => setActiveTab('firestore')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'firestore'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Firestore Database
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'auth' && <AuthExample />}
        {activeTab === 'firestore' && <FirestoreExample />}
      </div>
    </div>
  );
}

function RouterWithFirebase() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/firebase-demo" component={FirebaseDemo} />
      <Route path="/auth-example" component={AuthExample} />
      <Route path="/firestore-example" component={FirestoreExample} />
      <Route component={NotFound} />
    </Switch>
  );
}

export function AppWithFirebase() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="game-container">
          <RouterWithFirebase />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
