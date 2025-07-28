import { 
  type Question, 
  type InsertQuestion, 
  type GameSession, 
  type InsertGameSession,
  type User,
  type InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  
  // Questions
  getRandomQuestions(count: number): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;
  
  // Game Session
  createGameSession(userId?: string): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | undefined>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private questions: Map<string, Question>;
  private gameSessions: Map<string, GameSession>;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.gameSessions = new Map();
    this.initializeQuestions();
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      id,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  private initializeQuestions() {
    // Import questions from external file
    const questionsData = [
      // OAB 1ª FASE - DIREITO CONSTITUCIONAL
      {
        text: "Qual o prazo de mandato do Presidente da República?",
        options: ["3 anos", "4 anos", "5 anos", "6 anos"],
        correctAnswerIndex: 1,
        difficulty: 1,
        category: "Direito Constitucional",
        challengeType: "OAB_1_FASE",
        explanation: "O mandato presidencial é de 4 anos, permitida uma reeleição para o período subsequente."
      },
      {
        text: "O que acontece quando há revelia no processo?",
        options: ["Procedência automática do pedido", "Presunção de veracidade dos fatos alegados", "Extinção do processo", "Condenação em honorários"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "A revelia não implica automaticamente na procedência do pedido, apenas presume-se verdadeiros os fatos alegados pelo autor."
      },
      {
        text: "Qual o prazo para interposição do recurso de apelação?",
        options: ["5 dias", "10 dias", "15 dias", "30 dias"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "O prazo para apelação é de 15 dias úteis contados da intimação da decisão."
      },
      {
        text: "Quando é possível a citação por edital?",
        options: ["Como primeira opção", "Após tentativas de localização", "Apenas em casos urgentes", "Somente com autorização judicial"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "A citação por edital é medida excepcional, só sendo admitida após esgotadas as tentativas de localização do réu."
      },
      {
        text: "Sobre a antecipação de tutela, é correto afirmar:",
        options: ["Só pode ser concedida após contraditório", "Pode ser concedida liminarmente", "Depende sempre de caução", "É vedada em processos sumários"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "A tutela de urgência pode ser concedida liminarmente quando presentes os requisitos legais."
      },
      {
        text: "Qual o prazo para oferecimento de tríplica?",
        options: ["5 dias", "10 dias", "15 dias", "20 dias"],
        correctAnswerIndex: 2,
        difficulty: 3,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "O prazo para tríplica segue o mesmo prazo da contestação: 15 dias úteis."
      },
      {
        text: "A execução de título extrajudicial:",
        options: ["Necessita de processo de conhecimento", "Dispensa a fase de conhecimento", "Requer sentença prévia", "Depende de homologação"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "Títulos executivos extrajudiciais permitem execução direta, sem necessidade de processo de conhecimento prévio."
      },
      {
        text: "Quando pode ocorrer o indeferimento da petição inicial?",
        options: ["Após o contraditório", "Antes da citação do réu", "Apenas na sentença", "Somente em recurso"],
        correctAnswerIndex: 1,
        difficulty: 4,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "O indeferimento da petição inicial ocorre antes da citação do réu, não após o contraditório."
      },
      {
        text: "Sobre a competência territorial:",
        options: ["É sempre absoluta", "Pode ser alterada pelas partes", "Não pode ser modificada", "Depende do valor da causa"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "A competência relativa (territorial) pode ser modificada por acordo entre as partes ou por não alegação de incompetência."
      },
      {
        text: "A decisão interlocutória:",
        options: ["Faz coisa julgada material", "Faz coisa julgada formal", "Faz apenas preclusão", "Não produz efeitos"],
        correctAnswerIndex: 2,
        difficulty: 4,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "Apenas as sentenças de mérito fazem coisa julgada material. Decisões interlocutórias fazem preclusão."
      },
      {
        text: "O litisconsórcio necessário:",
        options: ["Só pode ser ativo", "Só pode ser passivo", "Pode ser ativo ou passivo", "Não existe no CPC"],
        correctAnswerIndex: 2,
        difficulty: 3,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "O litisconsórcio necessário pode ocorrer tanto no polo ativo quanto no passivo da relação processual."
      },
      {
        text: "A perícia em casos técnicos é:",
        options: ["Sempre obrigatória", "Sempre facultativa", "Facultativa conforme necessidade", "Vedada pelo CPC"],
        correctAnswerIndex: 2,
        difficulty: 3,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "A perícia é facultativa e depende da necessidade de esclarecimento de fatos que dependam de conhecimento técnico."
      },
      {
        text: "Qual o prazo para agravo de instrumento?",
        options: ["5 dias", "10 dias", "15 dias", "30 dias"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Processo Civil",
        challengeType: "OAB",
        explanation: "O prazo para agravo de instrumento é de 15 dias úteis contados da intimação da decisão."
      },
      // Questões para CONCURSOS
      {
        text: "Na organização dos tribunais, compete ao CNJ:",
        options: ["Julgar recursos extraordinários", "Controlar administrativamente os tribunais", "Legislar sobre direito processual", "Nomear desembargadores"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS",
        explanation: "O CNJ exerce controle administrativo e financeiro do Poder Judiciário."
      },
      {
        text: "Sobre os princípios da Administração Pública:",
        options: ["São apenas orientadores", "Têm força normativa obrigatória", "Aplicam-se só à União", "São facultativos"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS",
        explanation: "Os princípios da Administração Pública têm força normativa e são de observância obrigatória."
      },
      {
        text: "O regime jurídico-administrativo caracteriza-se por:",
        options: ["Igualdade com particulares", "Prerrogativas e sujeições", "Liberdade contratual", "Autonomia privada"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS",
        explanation: "O regime jurídico-administrativo confere prerrogativas de poder público e impõe sujeições especiais."
      },
      {
        text: "A licitação é obrigatória para:",
        options: ["Todas as contratações públicas", "Apenas obras acima de R$ 1 milhão", "Contratos que excedam limites legais", "Somente compras de bens"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS",
        explanation: "A licitação é obrigatória quando os valores excedem os limites estabelecidos em lei."
      },
      {
        text: "O ato administrativo discricionário:",
        options: ["Não pode ser controlado", "Pode ter mérito controlado", "Tem controle limitado à legalidade", "É imune ao controle judicial"],
        correctAnswerIndex: 2,
        difficulty: 4,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS",
        explanation: "O controle judicial do ato discricionário limita-se aos aspectos de legalidade, não adentrando o mérito administrativo."
      },
      {
        text: "Servidor público estável pode perder o cargo por:",
        options: ["Avaliação de desempenho negativa apenas", "Processo administrativo ou judicial", "Decisão unilateral da chefia", "Mudança de governo"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS",
        explanation: "A perda do cargo pelo servidor estável exige processo administrativo ou judicial com garantia de ampla defesa."
      },
      {
        text: "A responsabilidade civil do Estado é:",
        options: ["Sempre subjetiva", "Objetiva para danos causados por agentes", "Apenas por dolo", "Subsidiária"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS",
        explanation: "A Constituição estabelece responsabilidade objetiva do Estado por danos causados por seus agentes."
      },
      {
        text: "A Constituição pode ser alterada por:",
        options: ["Lei ordinária", "Emenda constitucional", "Decreto legislativo", "Medida provisória"],
        correctAnswerIndex: 1,
        difficulty: 1,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS",
        explanation: "A Constituição só pode ser alterada por emenda constitucional, seguindo procedimento específico."
      }
    ];

    sampleQuestions.forEach(question => {
      const id = randomUUID();
      this.questions.set(id, { ...question, id });
    });
  }

  async getRandomQuestions(count: number, challengeType?: string): Promise<Question[]> {
    let allQuestions = Array.from(this.questions.values());
    
    // Filter by challenge type if provided
    if (challengeType) {
      allQuestions = allQuestions.filter(q => q.challengeType === challengeType);
    }
    
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createGameSession(userId?: string, challengeType: string = "OAB"): Promise<GameSession> {
    const id = randomUUID();
    const session: GameSession = {
      id,
      userId: userId || null,
      challengeType,
      score: 0,
      level: 1,
      lives: 3,
      correctAnswers: 0,
      incorrectAnswers: 0,
      currentStreak: 0,
      questionNumber: 1,
      totalQuestions: 20,
      isGameOver: false,
      createdAt: new Date(),
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
