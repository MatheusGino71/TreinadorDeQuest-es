import { useState } from 'react';
import { FirebaseTest } from './components/firebase/FirebaseTest';
import { AuthExample } from './components/auth/AuthExample';

export function QuickFirebaseDemo() {
  const [activeView, setActiveView] = useState<'test' | 'auth'>('test');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🔥 Firebase Quick Demo</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveView('test')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeView === 'test'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Connection Test
            </button>
            <button
              onClick={() => setActiveView('auth')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeView === 'auth'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Authentication Demo
            </button>
          </div>
        </div>
      </div>

      <div className="py-8">
        {activeView === 'test' && <FirebaseTest />}
        {activeView === 'auth' && <AuthExample />}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-4 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">📝 Para usar em seu projeto:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Importe os hooks: <code className="bg-gray-100 px-1 rounded">useAuth</code>, <code className="bg-gray-100 px-1 rounded">useFirestore</code></li>
          <li>Use os serviços: <code className="bg-gray-100 px-1 rounded">authService</code>, <code className="bg-gray-100 px-1 rounded">firestoreService</code></li>
          <li>Consulte o <code className="bg-gray-100 px-1 rounded">FIREBASE_GUIDE.md</code> para exemplos completos</li>
        </ol>
      </div>
    </div>
  );
}
