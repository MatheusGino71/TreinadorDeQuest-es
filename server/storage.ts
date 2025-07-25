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
        text: "Qual é o prazo para apresentação de contestação em processo de conhecimento?",
        options: ["10 dias", "15 dias", "20 dias", "30 dias"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "Conforme o CPC, o prazo para contestação é de 15 dias úteis contados da citação."
      },
      {
        text: "O que acontece quando há revelia no processo?",
        options: ["Procedência automática do pedido", "Presunção de veracidade dos fatos alegados", "Extinção do processo", "Condenação em honorários"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A revelia não implica automaticamente na procedência do pedido, apenas presume-se verdadeiros os fatos alegados pelo autor."
      },
      {
        text: "Qual o prazo para interposição do recurso de apelação?",
        options: ["5 dias", "10 dias", "15 dias", "30 dias"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "O prazo para apelação é de 15 dias úteis contados da intimação da decisão."
      },
      {
        text: "Quando é possível a citação por edital?",
        options: ["Como primeira opção", "Após tentativas de localização", "Apenas em casos urgentes", "Somente com autorização judicial"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A citação por edital é medida excepcional, só sendo admitida após esgotadas as tentativas de localização do réu."
      },
      {
        text: "Sobre a antecipação de tutela, é correto afirmar:",
        options: ["Só pode ser concedida após contraditório", "Pode ser concedida liminarmente", "Depende sempre de caução", "É vedada em processos sumários"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "A tutela de urgência pode ser concedida liminarmente quando presentes os requisitos legais."
      },
      {
        text: "Qual o prazo para oferecimento de tríplica?",
        options: ["5 dias", "10 dias", "15 dias", "20 dias"],
        correctAnswerIndex: 2,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "O prazo para tríplica segue o mesmo prazo da contestação: 15 dias úteis."
      },
      {
        text: "A execução de título extrajudicial:",
        options: ["Necessita de processo de conhecimento", "Dispensa a fase de conhecimento", "Requer sentença prévia", "Depende de homologação"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "Títulos executivos extrajudiciais permitem execução direta, sem necessidade de processo de conhecimento prévio."
      },
      {
        text: "Quando pode ocorrer o indeferimento da petição inicial?",
        options: ["Após o contraditório", "Antes da citação do réu", "Apenas na sentença", "Somente em recurso"],
        correctAnswerIndex: 1,
        difficulty: 4,
        category: "Processo Civil",
        explanation: "O indeferimento da petição inicial ocorre antes da citação do réu, não após o contraditório."
      },
      {
        text: "Sobre a competência territorial:",
        options: ["É sempre absoluta", "Pode ser alterada pelas partes", "Não pode ser modificada", "Depende do valor da causa"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A competência relativa (territorial) pode ser modificada por acordo entre as partes ou por não alegação de incompetência."
      },
      {
        text: "A decisão interlocutória:",
        options: ["Faz coisa julgada material", "Faz coisa julgada formal", "Faz apenas preclusão", "Não produz efeitos"],
        correctAnswerIndex: 2,
        difficulty: 4,
        category: "Processo Civil",
        explanation: "Apenas as sentenças de mérito fazem coisa julgada material. Decisões interlocutórias fazem preclusão."
      },
      {
        text: "O litisconsórcio necessário:",
        options: ["Só pode ser ativo", "Só pode ser passivo", "Pode ser ativo ou passivo", "Não existe no CPC"],
        correctAnswerIndex: 2,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "O litisconsórcio necessário pode ocorrer tanto no polo ativo quanto no passivo da relação processual."
      },
      {
        text: "A perícia em casos técnicos é:",
        options: ["Sempre obrigatória", "Sempre facultativa", "Facultativa conforme necessidade", "Vedada pelo CPC"],
        correctAnswerIndex: 2,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A perícia é facultativa e depende da necessidade de esclarecimento de fatos que dependam de conhecimento técnico."
      },
      {
        text: "Qual o prazo para agravo de instrumento?",
        options: ["5 dias", "10 dias", "15 dias", "30 dias"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "O prazo para agravo de instrumento é de 15 dias úteis contados da intimação da decisão."
      },
      {
        text: "A audiência de mediação/conciliação é:",
        options: ["Sempre facultativa", "Obrigatória com participação obrigatória", "Obrigatória mas participação facultativa", "Apenas para casos complexos"],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "A audiência de mediação/conciliação é obrigatória, mas a participação efetiva das partes é facultativa."
      },
      {
        text: "Qual o prazo para embargos de declaração?",
        options: ["3 dias", "5 dias", "10 dias", "15 dias"],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Processo Civil",
        explanation: "Os embargos de declaração devem ser opostos no prazo de 5 dias úteis."
      },
      {
        text: "A emenda da petição inicial:",
        options: ["Pode ser feita quantas vezes necessário", "É permitida apenas uma vez", "Depende de justificativa especial após primeira oportunidade", "É vedada pelo CPC"],
        correctAnswerIndex: 2,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "O juiz deve dar oportunidade para emendar a inicial uma vez. Novas emendas dependem de justificativa especial."
      },
      {
        text: "Quando verificada a conexão entre processos:",
        options: ["A reunião é facultativa", "A reunião é obrigatória", "Depende do juiz", "Só ocorre se as partes concordarem"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "Verificada a conexão, a reunião dos processos é obrigatória para evitar decisões conflitantes."
      },
      {
        text: "A reconvenção deve ser apresentada:",
        options: ["A qualquer tempo", "Junto com a contestação", "Após a tríplica", "Apenas na sentença"],
        correctAnswerIndex: 1,
        difficulty: 3,
        category: "Processo Civil",
        explanation: "A reconvenção deve ser apresentada junto com a contestação, no prazo de resposta."
      },
      {
        text: "A tutela inibitória tem por objetivo:",
        options: ["Reparar dano já ocorrido", "Impedir prática de ato ilícito", "Executar decisão judicial", "Anular ato processual"],
        correctAnswerIndex: 1,
        difficulty: 4,
        category: "Processo Civil",
        explanation: "A tutela inibitória tem caráter preventivo, visando impedir a ocorrência ou repetição de ilícito."
      },
      {
        text: "No processo eletrônico, a procuração:",
        options: ["É dispensada", "Deve ser juntada em formato digital", "Só é aceita em papel", "Não tem validade"],
        correctAnswerIndex: 1,
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
