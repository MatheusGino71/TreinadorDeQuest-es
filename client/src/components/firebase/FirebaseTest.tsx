import { useState, useEffect } from 'react';
import { testFirebaseLightweight, testFirebaseBasicConnection } from '../../lib/firebase-test';

export function FirebaseTest() {
  const [status, setStatus] = useState({
    firebase: false,
    auth: false,
    firestore: false,
    storage: false,
    error: null as string | null,
    loading: false
  });

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      // First, do a lightweight test
      const lightResult = testFirebaseLightweight();
      
      if (lightResult.success && lightResult.tests) {
        setStatus(prev => ({
          ...prev,
          firebase: lightResult.tests.app,
          auth: lightResult.tests.auth,
          firestore: lightResult.tests.firestore,
          storage: lightResult.tests.storage,
          loading: false
        }));

        // Then try a more comprehensive test (optional)
        try {
          const fullResult = await testFirebaseBasicConnection();
          if (!fullResult.success) {
            setStatus(prev => ({ 
              ...prev, 
              error: `Advanced test: ${fullResult.message}`,
              loading: false
            }));
          }
        } catch (advancedError) {
          console.warn('Advanced test failed:', advancedError);
          // Don't update status - lightweight test was successful
        }
      } else {
        setStatus(prev => ({
          ...prev,
          error: lightResult.message,
          loading: false
        }));
      }

    } catch (error) {
      console.error('Firebase test failed:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }));
    }
  };

  const StatusIcon = ({ status }: { status: boolean }) => (
    <span className={`inline-block w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></span>
  );

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      
      {status.loading && (
        <div className="mb-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Testing connection...</span>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Firebase Initialized</span>
          <StatusIcon status={status.firebase} />
        </div>
        
        <div className="flex items-center justify-between">
          <span>Authentication Ready</span>
          <StatusIcon status={status.auth} />
        </div>
        
        <div className="flex items-center justify-between">
          <span>Firestore Connected</span>
          <StatusIcon status={status.firestore} />
        </div>

        <div className="flex items-center justify-between">
          <span>Storage Available</span>
          <StatusIcon status={status.storage} />
        </div>
      </div>

      {status.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <strong>Error:</strong> {status.error}
        </div>
      )}

      <button
        onClick={testFirebaseConnection}
        disabled={status.loading}
        className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition duration-200"
      >
        {status.loading ? 'Testing...' : 'Test Again'}
      </button>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Project ID:</strong> treinador-de-questoes</p>
        <p><strong>Status:</strong> {
          status.firebase && status.auth && status.firestore && status.storage
            ? '✅ All services connected' 
            : status.loading
            ? '⏳ Testing...'
            : '⚠️ Some services failed'
        }</p>
        <p className="mt-2 text-xs">
          <strong>Note:</strong> This test avoids Firebase Data Connect API to prevent 403 errors.
        </p>
      </div>
    </div>
  );
}
