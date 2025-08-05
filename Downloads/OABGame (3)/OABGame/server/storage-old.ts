import { randomUUID } from "crypto";
import type { 
  User, 
  Question, 
  GameSession, 
  InsertUser,
  InsertGameSession 
} from "@shared/schema";
import { questionsFromExcel } from "../clean_questions";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Question operations
  getQuestions(challengeType?: string): Promise<Question[]>;
  getRandomQuestions(count: number, challengeType?: string): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;

  // Game session operations
  createGameSession(insertGameSession: InsertGameSession): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | undefined>;
  updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private questions = new Map<string, Question>();
  private gameSessions = new Map<string, GameSession>();

  constructor() {
    this.initializeQuestions();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.users.size + 1;
    const user: User = {
      id,
      ...insertUser,
      username: insertUser.username || `user_${id}`,
      createdAt: new Date()
    };
    this.users.set(String(id), user);
    return user;
  }

  // Question operations
  async getQuestions(challengeType?: string): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    if (!challengeType) return allQuestions;
    
    return allQuestions.filter(question => 
      question.challengeType === challengeType
    );
  }

  async getRandomQuestions(count: number, challengeType?: string): Promise<Question[]> {
    const filteredQuestions = await this.getQuestions(challengeType);
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  // Game session operations
  async createGameSession(insertGameSession: InsertGameSession): Promise<GameSession> {
    const id = randomUUID();
    const gameSession: GameSession = {
      id,
      ...insertGameSession,
      createdAt: new Date()
    };
    this.gameSessions.set(id, gameSession);
    return gameSession;
  }

  async getGameSession(id: string): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }

  async updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const session = this.gameSessions.get(id);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      ...updates
    };
    
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }

  private initializeQuestions() {
    // Usar todas as questões do arquivo Excel processado
    questionsFromExcel.forEach((questionData, index) => {
      const id = `Q${String(index + 1).padStart(3, '0')}`;
      const question: Question = {
        id,
        ...questionData
      };
      this.questions.set(id, question);
    });
  }
}

export const storage = new MemStorage();
          "Compete privativamente à União legislar sobre direito civil, comercial, penal, processual, eleitoral, agrário, marítimo, aeronáutico, espacial e do trabalho.",
          "Compete aos Estados legislar privativamente sobre custas dos serviços forenses.",
          "Compete aos Municípios legislar sobre direito tributário, financeiro, penitenciário, econômico e urbanístico.",
          "É vedado à União, aos Estados, ao Distrito Federal e aos Municípios estabelecer cultos religiosos ou igrejas."
        ],
        correctAnswerIndex: 0,
        difficulty: 1,
        category: "Direito Constitucional",
        challengeType: "OAB_1_FASE",
        explanation: "É competência privativa da União legislar sobre essas matérias, conforme art. 22 da Constituição Federal."
      },
      {
        text: "Sobre os direitos fundamentais na Constituição Federal de 1988, é correto afirmar:",
        options: [
          "Os direitos e garantias fundamentais têm aplicação imediata, não dependendo de regulamentação.",
          "O rol de direitos fundamentais previsto na Constituição é taxativo.",
          "Os direitos fundamentais aplicam-se exclusivamente às relações entre particulares e o Estado.",
          "A casa é asilo inviolável do indivíduo, não podendo ninguém nela penetrar sem consentimento, salvo em caso de flagrante delito."
        ],
        correctAnswerIndex: 0,
        difficulty: 2,
        category: "Direito Constitucional",
        challengeType: "OAB_1_FASE", 
        explanation: "Conforme art. 5º, §1º da CF/88, as normas definidoras dos direitos e garantias fundamentais têm aplicação imediata."
      },
      {
        text: "No que tange à responsabilidade civil, analise as assertivas abaixo e assinale a alternativa correta:",
        options: [
          "A responsabilidade civil sempre exige a comprovação de culpa do agente causador do dano.",
          "O dano moral independe de comprovação de prejuízo econômico para ser indenizável.",
          "A legítima defesa exclui apenas a ilicitude, mas não afasta o dever de indenizar.",
          "A responsabilidade por dano causado por animal não admite excludentes."
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Civil",
        challengeType: "OAB_1_FASE",
        explanation: "O dano moral é indenizável independentemente de comprovação de prejuízo patrimonial, conforme entendimento consolidado."
      },
      {
        text: "Em relação aos contratos, assinale a alternativa correta:",
        options: [
          "O princípio da autonomia da vontade é absoluto, não admitindo limitações legais.",
          "A lesão é vício do consentimento que pode ensejar a anulabilidade do contrato.",
          "O contrato faz lei entre as partes, não podendo ser modificado por circunstâncias supervenientes.",
          "A cláusula resolutiva expressa depende de interpelação judicial para produzir efeitos."
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Civil",
        challengeType: "OAB_1_FASE",
        explanation: "A lesão é defeito do negócio jurídico que pode tornar o contrato anulável, conforme arts. 156-157 do Código Civil."
      },
      {
        text: "Sobre o processo de conhecimento no Novo CPC, assinale a alternativa correta:",
        options: [
          "A citação por edital é sempre admitida quando o réu se encontra em local incerto.",
          "A revelia produz sempre o efeito de presunção de veracidade dos fatos alegados pelo autor.",
          "O juiz pode determinar o comparecimento das partes para tentativa de conciliação a qualquer momento.",
          "A contestação deve ser apresentada no prazo de quinze dias contados da citação."
        ],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Processo Civil",
        challengeType: "OAB_1_FASE",
        explanation: "O juiz pode promover a autocomposição a qualquer tempo, sendo dever fundamental do Sistema de Justiça."
      },
      {
        text: "Em matéria de direito do trabalho, assinale a alternativa correta:",
        options: [
          "O aviso prévio indenizado não integra o tempo de serviço para efeitos legais.",
          "As horas extras habituais integram o salário para todos os efeitos legais.",
          "O empregado pode deixar o emprego sem aviso prévio quando comprovada falta grave do empregador.",
          "A jornada de trabalho pode ser livremente pactuada entre as partes, independentemente de limites legais."
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito do Trabalho", 
        challengeType: "OAB_1_FASE",
        explanation: "As horas extras habituais integram o salário para cálculo de férias, 13º salário, FGTS e outros direitos trabalhistas."
      },
      {
        text: "Sobre direito empresarial, assinale a alternativa correta:",
        options: [
          "Toda pessoa jurídica que exerce atividade econômica é considerada empresária.",
          "O empresário individual não precisa se inscrever no Registro Público de Empresas Mercantis.",
          "A sociedade limitada pode ter capital social dividido em ações.",
          "O estabelecimento empresarial é universalidade de fato composta por bens corpóreos e incorpóreos."
        ],
        correctAnswerIndex: 3,
        difficulty: 2,
        category: "Direito Empresarial",
        challengeType: "OAB_1_FASE",
        explanation: "O estabelecimento é universalidade de fato formada pelo conjunto de bens organizados pelo empresário para o exercício da empresa."
      },
      {
        text: "Em relação à ética profissional do advogado, assinale a alternativa correta:",
        options: [
          "O advogado pode aceitar procuração de cliente cujos interesses sejam conflitantes com os de cliente anterior.",
          "É vedado ao advogado funcionar no mesmo processo, simultaneamente, como patrono e preposto da mesma parte.",
          "O advogado não pode renunciar ao mandato durante o processo, devendo aguardar o seu término.",
          "O sigilo profissional do advogado pode ser quebrado mediante ordem judicial fundamentada."
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Ética Profissional",
        challengeType: "OAB_1_FASE",
        explanation: "É vedado ao advogado atuar simultaneamente como patrono e preposto da mesma parte no mesmo processo, conforme Código de Ética."
      },
      {
        text: "Sobre direito administrativo, assinale a alternativa correta:",
        options: [
          "O princípio da supremacia do interesse público é absoluto, não admitindo ponderação com interesses privados.",
          "A administração pública pode revogar seus próprios atos quando inconvenientes ou inoportunos.",
          "O servidor público não pode ser responsabilizado civilmente por danos causados a terceiros no exercício de suas funções.",
          "O controle judicial dos atos administrativos está limitado aos aspectos de legalidade, sendo vedado o controle de mérito."
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS_MPSP",
        explanation: "A administração pode revogar seus atos quando inconvenientes ou inoportunos, por motivos de conveniência e oportunidade."
      },
      {
        text: "Em relação aos princípios do direito tributário, assinale a alternativa correta:",
        options: [
          "O princípio da anterioridade veda a cobrança de tributos no mesmo exercício financeiro da publicação da lei.",
          "A imunidade tributária é limitação ao poder de tributar prevista na própria Constituição.",
          "O princípio da capacidade contributiva permite a tributação confiscatória em casos excepcionais.",
          "A não cumulatividade aplica-se a todos os impostos indistintamente."
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Tributário",
        challengeType: "OAB_1_FASE",
        explanation: "A imunidade tributária é limitação constitucional ao poder de tributar, sendo hipótese de não incidência constitucionalmente qualificada."
      },
      {
        text: "O Ministério Público tem legitimidade para propor ação civil pública visando:",
        options: [
          "Apenas interesses difusos",
          "Apenas interesses coletivos", 
          "Interesses difusos, coletivos e individuais homogêneos",
          "Apenas direitos individuais"
        ],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Processual Civil",
        challengeType: "CONCURSOS_MPSP",
        explanation: "O MP tem legitimidade para tutelar interesses difusos, coletivos e individuais homogêneos."
      },
      {
        text: "A Defensoria Pública tem como função institucional:",
        options: [
          "Representar apenas os necessitados",
          "Assistência jurídica integral e gratuita", 
          "Advocacia privada subsidiada",
          "Consultoria jurídica paga"
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS_DEFENSORIA",
        explanation: "A Defensoria Pública presta assistência jurídica integral e gratuita aos necessitados."
      },
      {
        text: "Compete privativamente ao Tribunal de Justiça:",
        options: [
          "Julgar prefeitos",
          "Processar deputados estaduais", 
          "Julgar mandado de segurança contra atos do governador",
          "Todas as alternativas"
        ],
        correctAnswerIndex: 3,
        difficulty: 3,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS_TRIBUNAIS",
        explanation: "São competências privativas do TJ julgar prefeitos, deputados estaduais e mandados de segurança contra atos do governador."
      },
      // Questões adicionais para CONCURSOS
      {
        text: "No processo penal, a prisão preventiva pode ser decretada:",
        options: [
          "Em qualquer crime doloso",
          "Apenas em crimes hediondos",
          "Para garantir a ordem pública, ordem econômica, por conveniência da instrução criminal ou para assegurar a aplicação da lei penal",
          "Somente quando há flagrante delito"
        ],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Penal",
        challengeType: "CONCURSOS_MPSP",
        explanation: "A prisão preventiva tem os fundamentos previstos no art. 312 do CPP: garantia da ordem pública, ordem econômica, conveniência da instrução criminal ou aplicação da lei penal."
      },
      {
        text: "Sobre os serviços públicos, é correto afirmar:",
        options: [
          "Todos os serviços públicos podem ser prestados diretamente por particulares",
          "A concessão de serviço público independe de licitação",
          "O serviço público deve ser prestado com adequação, continuidade, eficiência, segurança, atualidade e generalidade",
          "O usuário não tem direito à informação sobre a prestação do serviço"
        ],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS_TRIBUNAIS",
        explanation: "Os princípios dos serviços públicos estão previstos na Lei 8.987/95, incluindo adequação, continuidade, eficiência, segurança, atualidade e generalidade."
      },
      {
        text: "A Defensoria Pública pode atuar em:",
        options: [
          "Apenas na área criminal",
          "Apenas na área cível", 
          "Em todas as áreas do Direito, incluindo cível, criminal, trabalhista e administrativa",
          "Apenas em causas de valor até 5 salários mínimos"
        ],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS_DEFENSORIA",
        explanation: "A Defensoria Pública atua em todas as áreas do Direito para prestar assistência jurídica integral e gratuita aos necessitados."
      },
      {
        text: "O inquérito civil é instrumento de investigação:",
        options: [
          "Exclusivo da Polícia Civil",
          "Do Ministério Público para apuração de fatos que possam ensejar ação civil pública",
          "Apenas do Ministério Público Federal",
          "Somente para crimes contra a administração pública"
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Processual Civil",
        challengeType: "CONCURSOS_MPSP",
        explanation: "O inquérito civil é procedimento investigatório do MP para apurar fatos relacionados a interesses difusos, coletivos e individuais homogêneos."
      },
      {
        text: "Em relação aos recursos no processo civil, é correto afirmar:",
        options: [
          "Todos os recursos têm efeito suspensivo",
          "O prazo para recurso é sempre de 15 dias",
          "A apelação é o recurso cabível contra sentença",
          "Não é possível desistir de recurso já interposto"
        ],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Processual Civil",
        challengeType: "CONCURSOS_TRIBUNAIS",
        explanation: "A apelação é o recurso típico contra sentenças, conforme art. 1009 do CPC."
      },
      {
        text: "A garantia constitucional do contraditório e ampla defesa aplica-se:",
        options: [
          "Apenas ao processo penal",
          "Apenas aos processos judiciais",
          "A todos os processos judiciais e administrativos",
          "Apenas quando há privação de liberdade"
        ],
        correctAnswerIndex: 2,
        difficulty: 2,
        category: "Direito Constitucional",
        challengeType: "CONCURSOS_DEFENSORIA",
        explanation: "O art. 5º, LV da CF/88 garante o contraditório e ampla defesa em todos os processos judiciais e administrativos."
      },
      {
        text: "O servidor público pode:",
        options: [
          "Exercer atividade político-partidária sem restrições",
          "Acumular dois cargos privativos de médico",
          "Receber propina para acelerar processos",
          "Participar de greves em qualquer circunstância"
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Administrativo",
        challengeType: "CONCURSOS_MPSP",
        explanation: "É permitida a acumulação de dois cargos privativos de profissionais de saúde com profissões regulamentadas, conforme art. 37, XVI da CF/88."
      },
      {
        text: "A competência dos juizados especiais criminais abrange:",
        options: [
          "Todos os crimes dolosos",
          "Infrações penais de menor potencial ofensivo (pena máxima até 2 anos)",
          "Apenas contravenções penais",
          "Crimes com pena máxima de 6 meses"
        ],
        correctAnswerIndex: 1,
        difficulty: 2,
        category: "Direito Penal",
        challengeType: "CONCURSOS_TRIBUNAIS",
        explanation: "Os JECrim julgam infrações de menor potencial ofensivo, com pena máxima não superior a 2 anos, conforme Lei 9.099/95."
      }
    ];

    // Adicionar questões ao storage com IDs únicos
    questionsData.forEach((questionData, index) => {
      const id = `Q${String(index + 1).padStart(3, '0')}`;
      const question: Question = {
        id,
        ...questionData
      };
      this.questions.set(id, question);
    });
  }
}

export const storage = new MemStorage();