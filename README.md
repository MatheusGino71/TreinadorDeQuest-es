# Treinador de Questões - Sistema de Estudo Jurídico

Um sistema gamificado de treinamento para questões jurídicas, focado na preparação para OAB 1ª Fase e Concursos Públicos.

## 🎯 Características Principais

- **Sistema de Autenticação Completo**: Login e registro seguro com hash de senha
- **Questões Autênticas**: 531 questões reais extraídas de provas (450 OAB + 81 Concursos)
- **Gamificação**: Sistema de vidas, power-ups, pontuação e streaks
- **Modalidades de Estudo**: OAB 1ª Fase e Concursos (MPSP)
- **Estatísticas Detalhadas**: Análise completa de performance com erros e acertos
- **Interface Responsiva**: Design moderno e acessível

## 🎮 Mecânicas do Jogo

### Sistema de Vidas
- 3 vidas por sessão
- Perde 1 vida a cada erro
- Reset automático após game over

### Power-ups Disponíveis
- **50/50**: Elimina 2 opções incorretas
- **Tempo Extra**: +30 segundos na questão atual
- **Pular Questão**: Avança sem perder vida

### Limite de Questões
- **20 questões por sessão** (seleção aleatória do banco completo)
- **60 segundos** por questão
- **Embaralhamento automático** das opções

## 📊 Estatísticas e Análise

- **Performance por Categoria**: Direito Civil, Penal, Constitucional, etc.
- **Histórico Detalhado**: Todas as respostas são salvas no banco PostgreSQL
- **Análise de Erros**: Questões incorretas com explicações e respostas corretas
- **Tempo de Resposta**: Tracking do tempo gasto por questão

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** + shadcn/ui
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento
- **Vite** para build e desenvolvimento

### Backend
- **Node.js** + Express.js
- **TypeScript** com ES modules
- **PostgreSQL** com Drizzle ORM
- **bcrypt** para hash de senhas
- **Neon Database** (serverless)

### Banco de Dados
- **PostgreSQL** com 4 tabelas principais:
  - `users`: Usuários do sistema
  - `questions`: Banco de questões jurídicas
  - `game_session`: Sessões de jogo
  - `user_answers`: Histórico de respostas

## 📈 Dados das Questões

### Categorias OAB 1ª Fase (450 questões)
- Direito Civil
- Direito Penal  
- Direito Constitucional
- Ética Profissional
- Direito Empresarial
- Direito do Trabalho
- Direito Administrativo
- Direito Tributário
- E outras disciplinas

### Concursos MPSP (81 questões)
- Direito Administrativo
- Direito Constitucional

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Variáveis de ambiente configuradas

### Instalação
```bash
# Clone o repositório
git clone https://github.com/MatheusGino71/TreinadorDeQuestoes.git

# Instale as dependências
npm install

# Configure o banco de dados
npm run db:push

# Execute em desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
DATABASE_URL=sua_url_postgresql
PGHOST=host_do_banco
PGPORT=5432
PGUSER=usuario
PGPASSWORD=senha
PGDATABASE=nome_do_banco
```

## 📱 Funcionalidades da Interface

### Tela de Login
- Autenticação segura
- Validação em tempo real
- Mensagens de erro em português

### Tela de Preparação
- Seleção de modalidade (OAB/Concursos)
- Explicação dos power-ups
- Tutorial de controles

### Tela de Jogo
- Timer visual de 60 segundos
- Barra de progresso da sessão
- Interface de power-ups
- Estatísticas em tempo real

### Modal de Estatísticas
- Performance detalhada por categoria
- Lista de questões erradas com explicações
- Lista de questões corretas
- Tempo médio de resposta

## 🔧 Arquitetura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   └── lib/           # Utilitários
├── server/                # Backend Node.js
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de dados
│   └── db.ts            # Configuração do banco
├── shared/               # Tipos compartilhados
│   └── schema.ts        # Schema Drizzle
└── attached_assets/     # Arquivos Excel originais
```

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login

### Jogo
- `POST /api/game/start` - Iniciar nova sessão
- `POST /api/game/answer` - Submeter resposta
- `GET /api/game/session/:id` - Buscar sessão

### Estatísticas
- `GET /api/session/:sessionId/answers` - Respostas da sessão
- `GET /api/user/:userId/stats` - Estatísticas do usuário

### Questões
- `GET /api/questions/count` - Contagem por modalidade
- `GET /api/questions/all` - Todas as questões

## 🎨 Design e UX

- **Design Responsivo**: Funciona perfeitamente em mobile e desktop
- **Tema Escuro**: Interface otimizada para longas sessões de estudo
- **Feedback Visual**: Animações e transições suaves
- **Acessibilidade**: Componentes acessíveis com shadcn/ui

## 🔄 Fluxo de Dados

1. **Inicialização**: Cliente solicita nova sessão, servidor retorna 20 questões aleatórias
2. **Gameplay**: Cliente envia respostas, servidor valida e atualiza estado
3. **Persistência**: Todas as respostas são salvas no PostgreSQL
4. **Estatísticas**: Análise em tempo real dos dados históricos

## 🏗 Próximas Melhorias

- [ ] Ranking de usuários
- [ ] Modo multiplayer
- [ ] Questões dissertativas
- [ ] Simulados completos
- [ ] Exportação de relatórios
- [ ] Integração com calendário de estudos

## 👨‍💻 Desenvolvedor

**Matheus Gino** - [GitHub](https://github.com/MatheusGino71)

**Powered by BIPETech** 🚀

## 📄 Licença

Este projeto é licenciado sob a MIT License.

---

*Transformando o estudo jurídico em uma experiência gamificada e eficiente!*