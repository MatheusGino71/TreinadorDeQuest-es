import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile({
              id: firebaseUser.uid,
              ...userDoc.data()
            } as UserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      setLoading(true);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });

      // Create user profile in Firestore
      const profile: UserProfile = {
        id: userCredential.user.uid,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: 'user',
        createdAt: new Date(),
        lastLoginAt: new Date()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), profile);
      setUserProfile(profile);

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Treinador de Questões",
      });

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      let message = "Erro ao criar conta";
      
      if (error.code === 'auth/email-already-in-use') {
        message = "Este email já está em uso";
      } else if (error.code === 'auth/weak-password') {
        message = "A senha deve ter pelo menos 6 caracteres";
      } else if (error.code === 'auth/invalid-email') {
        message = "Email inválido";
      }

      toast({
        title: "Erro no cadastro",
        description: message,
        variant: "destructive",
      });

      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in Firestore
      await setDoc(
        doc(db, 'users', userCredential.user.uid), 
        { lastLoginAt: new Date() }, 
        { merge: true }
      );

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      let message = "Email ou senha incorretos";
      
      if (error.code === 'auth/user-not-found') {
        message = "Usuário não encontrado";
      } else if (error.code === 'auth/wrong-password') {
        message = "Senha incorreta";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Muitas tentativas. Tente novamente mais tarde";
      }

      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });

      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast({
        title: "Logout realizado",
        description: "Até a próxima!",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    userProfile,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin'
  };
}