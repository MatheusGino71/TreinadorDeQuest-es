import { useState } from 'react';
import { useCollection, useFirestore } from '../../hooks/use-firestore';
import { firestoreService } from '../../lib/firestore';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: any;
}

export function FirestoreExample() {
  const { data: questions, loading, error } = useCollection<Question>('questions');
  const { createDocument, updateDocument, deleteDocument, loading: operationLoading } = useFirestore();
  
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    subject: '',
    difficulty: 'medium' as const
  });

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument('questions', newQuestion);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        subject: '',
        difficulty: 'medium'
      });
      alert('Questão criada com sucesso!');
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Erro ao criar questão');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Tem certeza que deseja deletar esta questão?')) {
      try {
        await deleteDocument('questions', questionId);
        alert('Questão deletada com sucesso!');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Erro ao deletar questão');
      }
    }
  };

  const updateOptionText = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-600 text-center">Erro: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Gerenciamento de Questões (Firestore)</h1>
      
      {/* Form para criar nova questão */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Criar Nova Questão</h2>
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pergunta</label>
            <textarea
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Opções de Resposta</label>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center mt-2">
                <span className="mr-2">{String.fromCharCode(65 + index)}:</span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOptionText(index, e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={newQuestion.correctAnswer === index}
                  onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                  className="ml-2"
                />
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Matéria</label>
              <input
                type="text"
                value={newQuestion.subject}
                onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Dificuldade</label>
              <select
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={operationLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition duration-200"
          >
            {operationLoading ? 'Criando...' : 'Criar Questão'}
          </button>
        </form>
      </div>

      {/* Lista de questões */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Questões Cadastradas ({questions.length})
        </h2>
        
        {questions.length === 0 ? (
          <p className="text-gray-600">Nenhuma questão cadastrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{question.question}</h3>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    disabled={operationLoading}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Deletar
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {question.options?.map((option, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded ${
                        question.correctAnswer === index 
                          ? 'bg-green-100 border border-green-300' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}:</span> {option}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 text-sm text-gray-600">
                  <span><strong>Matéria:</strong> {question.subject}</span>
                  <span><strong>Dificuldade:</strong> {question.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
