# Firebase Integration Guide

Este guia mostra como usar o Firebase que foi configurado no seu projeto.

## 🔥 Firebase Configurado

O Firebase foi inicializado com os seguintes serviços:
- **Authentication** - Para autenticação de usuários
- **Firestore** - Base de dados NoSQL
- **Storage** - Armazenamento de arquivos
- **Functions** - Funções serverless
- **Analytics** - Análise de uso

## 📁 Arquivos Criados

### Configuração Principal
- `client/src/lib/firebase.ts` - Configuração principal do Firebase

### Serviços
- `client/src/lib/auth.ts` - Funções de autenticação
- `client/src/lib/firestore.ts` - Funções do Firestore
- `client/src/lib/storage.ts` - Funções do Storage

### Hooks React
- `client/src/hooks/use-auth.tsx` - Hook para autenticação
- `client/src/hooks/use-firestore.tsx` - Hook para Firestore

### Componentes de Exemplo
- `client/src/components/auth/AuthExample.tsx` - Exemplo de autenticação
- `client/src/components/firestore/FirestoreExample.tsx` - Exemplo do Firestore
- `client/src/AppWithFirebase.tsx` - App demo com Firebase

## 🚀 Como Usar

### 1. Autenticação

```tsx
import { useAuth } from './hooks/use-auth';

function MyComponent() {
  const { user, signIn, signUp, signOut, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('email@example.com', 'password');
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bem-vindo, {user?.email}!</p>
          <button onClick={signOut}>Sair</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Entrar</button>
      )}
    </div>
  );
}
```

### 2. Firestore Database

```tsx
import { useCollection, useFirestore } from './hooks/use-firestore';

function QuestionsComponent() {
  const { data: questions, loading } = useCollection('questions');
  const { createDocument } = useFirestore();

  const addQuestion = async () => {
    await createDocument('questions', {
      question: 'Qual é a capital do Brasil?',
      options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
      correctAnswer: 2,
      subject: 'Geografia'
    });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <button onClick={addQuestion}>Adicionar Questão</button>
      {questions.map(q => (
        <div key={q.id}>{q.question}</div>
      ))}
    </div>
  );
}
```

### 3. Storage (Upload de Arquivos)

```tsx
import { storageService } from './lib/storage';

function FileUpload() {
  const handleFileUpload = async (file: File) => {
    try {
      const downloadURL = await storageService.uploadFile(
        file, 
        `uploads/${file.name}`,
        (progress) => console.log(`Upload ${progress}% completo`)
      );
      console.log('Arquivo disponível em:', downloadURL);
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
      }} 
    />
  );
}
```

## 🛠️ Integração com o Projeto Existente

### Opção 1: Substituir Autenticação Atual

Para usar Firebase Auth no lugar do sistema atual:

1. Substitua as chamadas de login em `login-simple.tsx`
2. Use `useAuth()` hook no lugar do localStorage
3. Atualize o `App.tsx` para usar Firebase Auth

### Opção 2: Usar Firebase para Questões

Para migrar questões para o Firestore:

1. Use `firestoreService.createDocument()` para adicionar questões
2. Use `useCollection('questions')` para listar questões
3. Substitua as chamadas da API REST por Firestore

### Opção 3: Demo Separado

Para testar Firebase separadamente:

```bash
# Inicie o projeto e navegue para:
http://localhost:5173/firebase-demo
```

## 📊 Estrutura de Dados Sugerida

### Usuários
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'admin';
  createdAt: Timestamp;
}
```

### Questões
```typescript
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Timestamp;
}
```

### Resultados de Jogos
```typescript
interface GameResult {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  subject: string;
  difficulty: string;
  completedAt: Timestamp;
}
```

## 🔧 Configuração Adicional

### Firebase Rules (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Questões podem ser lidas por todos usuários autenticados
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && resource.data.role == 'admin';
    }
    
    // Resultados podem ser lidos/escritos pelo próprio usuário
    match /gameResults/{resultId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Firebase Rules (Storage)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Usuários podem upload apenas em suas pastas
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins podem fazer upload de questões
    match /questions/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

## 🎯 Próximos Passos

1. **Testar a Demo**: Acesse `/firebase-demo` para ver os exemplos funcionando
2. **Integrar Gradualmente**: Comece substituindo uma funcionalidade por vez
3. **Configurar Rules**: Defina regras de segurança no Firebase Console
4. **Deploy**: Configure o hosting do Firebase para deploy automático

## 🆘 Suporte

Se precisar de ajuda:
1. Verifique o console do navegador para erros
2. Consulte a [documentação do Firebase](https://firebase.google.com/docs)
3. Use os exemplos criados como referência
