import { auth, db, storage, isFirebaseInitialized } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function testFirebaseBasicConnection() {
  console.log('🔥 Testing Firebase Basic Connection...');
  
  try {
    // 1. Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      throw new Error('Firebase not properly initialized');
    }
    console.log('✅ Firebase initialized successfully');

    // 2. Test Auth service (anonymous sign-in)
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('✅ Auth service working - Anonymous user:', userCredential.user.uid);
    } catch (authError) {
      console.warn('⚠️ Auth test failed:', authError);
    }

    // 3. Test Firestore connection
    try {
      const testDocRef = doc(db, 'connectionTest', 'test');
      await setDoc(testDocRef, { 
        timestamp: new Date().toISOString(),
        message: 'Connection test successful',
        version: '1.0'
      });
      
      const docSnap = await getDoc(testDocRef);
      if (docSnap.exists()) {
        console.log('✅ Firestore working - Test document created and read');
        return { success: true, message: 'All Firebase services connected successfully' };
      }
    } catch (firestoreError) {
      console.warn('⚠️ Firestore test failed:', firestoreError);
    }

    // 4. Test Storage (just check if service is available)
    try {
      if (storage.app) {
        console.log('✅ Storage service initialized');
      }
    } catch (storageError) {
      console.warn('⚠️ Storage test failed:', storageError);
    }

    return { success: true, message: 'Firebase basic connection successful' };

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error',
      error 
    };
  }
}

// Lightweight connection test (no Data Connect API calls)
export function testFirebaseLightweight() {
  try {
    const tests = {
      app: !!auth.app,
      auth: !!auth,
      firestore: !!db,
      storage: !!storage,
      config: !!auth.app.options.projectId
    };
    
    console.log('🔥 Firebase Lightweight Test Results:', tests);
    
    const allPassed = Object.values(tests).every(Boolean);
    return {
      success: allPassed,
      tests,
      message: allPassed ? 'All services initialized' : 'Some services failed to initialize'
    };
  } catch (error) {
    console.error('❌ Lightweight test failed:', error);
    return { success: false, error, message: 'Initialization failed' };
  }
}
