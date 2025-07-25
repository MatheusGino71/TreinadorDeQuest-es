import { type Question, type InsertQuestion, type GameSession, type InsertGameSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Questions
  getRandomQuestions(count: number): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;
  
  // Game Session
  createGameSession(): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | undefined>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
}

export class MemStorage implements IStorage {
  private questions: Map<string, Question>;
  private gameSessions: Map<string, GameSession>;

  constructor() {
    this.questions = new Map();
    this.gameSessions = new Map();
    this.initializeQuestions();
  }

  private initializeQuestions() {
    const sampleQuestions: Omit<Question, 'id'>[] = [
      {
        text: "O prazo para apresentação de contestação em processo de conhecimento é de 15 dias, contados da citação válida.",
        correctAnswer: true,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "Conforme o CPC, o prazo para contestação é realmente de 15 dias úteis contados da citação."
      },
      {
        text: "A revelia implica necessariamente na procedência total do pedido do autor.",
        correctAnswer: false,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A revelia não implica automaticamente na procedência do pedido, apenas presume-se verdadeiros os fatos alegados pelo autor."
      },
      {
        text: "O recurso de apelação deve ser interposto no prazo de 15 dias contados da intimação da sentença.",
        correctAnswer: true,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "O prazo para apelação é de 15 dias úteis contados da intimação da decisão."
      },
      {
        text: "É possível a citação por edital como primeira opção para localizar o réu.",
        correctAnswer: false,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A citação por edital é medida excepcional, só sendo admitida após esgotadas as tentativas de localização do réu."
      },
      {
        text: "A antecipação de tutela pode ser concedida liminarmente pelo juiz.",
        correctAnswer: true,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "A tutela de urgência pode ser concedida liminarmente quando presentes os requisitos legais."
      },
      {
        text: "O prazo para oferecimento de tríplica é de 15 dias.",
        correctAnswer: true,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "O prazo para tríplica segue o mesmo prazo da contestação e da tríplica: 15 dias úteis."
      },
      {
        text: "A execução de título extrajudicial dispensa a fase de conhecimento.",
        correctAnswer: true,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "Títulos executivos extrajudiciais permitem execução direta, sem necessidade de processo de conhecimento prévio."
      },
      {
        text: "O juiz pode indeferir a petição inicial mesmo após o contraditório.",
        correctAnswer: false,
        difficulty: 4,
        category: "Processo Civil",
        explanation: "O indeferimento da petição inicial ocorre antes da citação do réu, não após o contraditório."
      },
      {
        text: "A competência territorial pode ser alterada pela vontade das partes.",
        correctAnswer: true,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A competência relativa (territorial) pode ser modificada por acordo entre as partes ou por não alegação de incompetência."
      },
      {
        text: "A decisão interlocutória faz coisa julgada material.",
        correctAnswer: false,
        difficulty: 4,
        category: "Processo Civil",
        explanation: "Apenas as sentenças de mérito fazem coisa julgada material. Decisões interlocutórias fazem preclusão."
      },
      {
        text: "O litisconsórcio necessário pode ser ativo ou passivo.",
        correctAnswer: true,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "O litisconsórcio necessário pode ocorrer tanto no polo ativo quanto no passivo da relação processual."
      },
      {
        text: "A perícia é sempre obrigatória em casos que envolvem questões técnicas.",
        correctAnswer: false,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A perícia é facultativa e depende da necessidade de esclarecimento de fatos que dependam de conhecimento técnico."
      },
      {
        text: "O agravo de instrumento deve ser interposto no prazo de 15 dias.",
        correctAnswer: true,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "O prazo para agravo de instrumento é de 15 dias úteis contados da intimação da decisão."
      },
      {
        text: "A mediação é obrigatória em todos os processos cíveis.",
        correctAnswer: false,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "A audiência de mediação/conciliação é obrigatória, mas a mediação em si não, podendo as partes optar por não participar."
      },
      {
        text: "O prazo para embargos de declaração é de 5 dias.",
        correctAnswer: true,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "Os embargos de declaração devem ser opostos no prazo de 5 dias úteis."
      },
      {
        text: "A petição inicial pode ser emendada quantas vezes for necessário.",
        correctAnswer: false,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "O juiz deve dar oportunidade para emendar a inicial uma vez. Novas emendas dependem de justificativa especial."
      },
      {
        text: "A conexão de processos é sempre obrigatória quando verificada.",
        correctAnswer: true,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "Verificada a conexão, a reunião dos processos é obrigatória para evitar decisões conflitantes."
      },
      {
        text: "O réu pode reconvir em qualquer fase do processo.",
        correctAnswer: false,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A reconvenção deve ser apresentada junto com a contestação, no prazo de resposta."
      },
      {
        text: "A tutela inibitória visa impedir a prática de ato ilícito.",
        correctAnswer: true,
        difficulty: 4,
        category: "Processo Civil",
        explanation: "A tutela inibitória tem caráter preventivo, visando impedir a ocorrência ou repetição de ilícito."
      },
      {
        text: "O processo eletrônico dispensa a juntada de procuração.",
        correctAnswer: false,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "Mesmo no processo eletrônico, a procuração deve ser juntada, podendo ser em formato digital."
      }
    ];

    sampleQuestions.forEach(question => {
      const id = randomUUID();
      this.questions.set(id, { ...question, id });
    });
  }

  async getRandomQuestions(count: number): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createGameSession(): Promise<GameSession> {
    const id = randomUUID();
    const session: GameSession = {
      id,
      score: 0,
      level: 1,
      lives: 3,
      correctAnswers: 0,
      incorrectAnswers: 0,
      currentStreak: 0,
      questionNumber: 1,
      totalQuestions: 20,
      isGameOver: false,
    };
    this.gameSessions.set(id, session);
    return session;
  }

  async getGameSession(id: string): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const session = this.gameSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
