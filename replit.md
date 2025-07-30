# Treinador de Questões - Sistema de Estudo Jurídico

## Overview

This is a React-based quiz game application focused on Brazilian legal studies, specifically targeting OAB (Ordem dos Advogados do Brasil) exam preparation. The application features a multiple-choice question format (4 options) with gamification elements like lives, power-ups, and scoring systems. The app now includes a complete user authentication system with login/registration and a preparation screen before gameplay.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks with TanStack Query for server state
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Session Management**: In-memory storage with planned database integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless driver
- **Current Storage**: In-memory storage for development (MemStorage class)
- **Migration**: Drizzle Kit for schema management

## Key Components

### Authentication System
- **User Registration**: Complete signup with name, email, password, and phone
- **Login System**: Secure authentication with password hashing using bcrypt
- **Session Management**: localStorage-based session persistence
- **Form Validation**: Real-time validation with Portuguese error messages

### Preparation Screen
- **Game Instructions**: Interactive tutorial with rules and controls
- **Challenge Type Selection**: Choose between OAB (Processo Civil) or CONCURSOS (Direito Administrativo/Constitucional)
- **Power-up Explanations**: Detailed descriptions of available power-ups
- **Keyboard Controls Guide**: Complete list of game shortcuts
- **Visual Statistics**: Preview of game parameters (questions, lives, time limits)

### Game Engine
- **Game Session Management**: Tracks player progress, score, lives, streaks, and challenge type
- **Question System**: Handles multiple-choice questions (4 options) with difficulty ratings, categories, and challenge types (OAB/CONCURSOS)
- **Content Filtering**: Questions are filtered by selected challenge type (OAB or CONCURSOS)
- **Power-ups**: Three types - 50/50 (eliminates 2 wrong options), extra time, and skip question
- **Timer System**: 20-second countdown per question with visual indicator

### UI Components
- **Game Interface**: Header with stats, question card, answer buttons, timer
- **Modals**: Game over and pause functionality
- **Power-ups Interface**: Visual power-up buttons with usage tracking
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### API Endpoints
- `POST /api/game/start` - Initialize new game session
- `GET /api/game/session/:id` - Retrieve game session data
- `POST /api/game/answer` - Submit answer and update game state

## Data Flow

1. **Game Initialization**: Client requests new game session, server creates session and returns 20 random questions
2. **Question Display**: Client displays questions one by one with timer and UI controls
3. **Answer Submission**: Client sends answer with timing data, server validates and updates session
4. **State Updates**: Server calculates score, updates lives, and manages game progression
5. **Game Completion**: Session ends when lives reach zero or all questions answered

## External Dependencies

### Frontend Dependencies
- **UI Framework**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Data Fetching**: TanStack Query for caching and synchronization
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns for time formatting

### Backend Dependencies
- **Database**: Neon Database with Drizzle ORM
- **Validation**: Zod schemas for type-safe API contracts
- **Development**: tsx for TypeScript execution
- **Build**: esbuild for production bundling

## Deployment Strategy

### Development
- **Client**: Vite dev server with HMR on client directory
- **Server**: tsx with nodemon-like reloading
- **Database**: Drizzle push for schema synchronization

### Production
- **Build Process**: Vite builds client to `dist/public`, esbuild bundles server to `dist/`
- **Static Serving**: Express serves built client files
- **Environment**: NODE_ENV-based configuration
- **Database**: PostgreSQL with connection pooling via Neon

### Key Architectural Decisions

1. **Monorepo Structure**: Shared schema between client and server in `shared/` directory
2. **Type Safety**: End-to-end TypeScript with Zod validation
3. **Database Abstraction**: Storage interface allows switching between in-memory and persistent storage
4. **Component Architecture**: Shadcn/ui for consistent, accessible components
5. **State Management**: Server state via TanStack Query, local state via React hooks
6. **Gaming Elements**: Lives system, power-ups, and progressive difficulty for engagement

## Recent Updates (January 31, 2025)

### Deploy e Documentação Externa
- **Documentação Completa para GitHub**: README.md detalhado com instruções de setup
- **SETUP_LOCAL.md**: Guia passo a passo para rodar o projeto fora do Replit
- **.env.example**: Arquivo de exemplo para configuração local
- **DEPLOY_INSTRUCTIONS.md**: Instruções completas para deploy no GitHub e outras plataformas
- **Estrutura Preparada**: Projeto totalmente preparado para repositório GitHub "TreinadorDeQuestoes"
- **Sistema Finalizado**: 20 questões por sessão, banco completo de 531 questões, estatísticas funcionais

## Previous Updates (January 28, 2025)

- **Implementação Completa das 50 Questões do Excel**: Todas as questões reais do arquivo Excel foram integradas com sucesso
- **44 Questões OAB 1ª FASE**: Todas as disciplinas da primeira fase (Direito Penal, Civil, Constitucional, Ética Profissional, etc.)
- **6 Questões CONCURSOS MPSP**: Questões específicas de Direito Administrativo para concursos
- **Sistema Dinâmico de Questões**: O jogo agora usa todas as questões disponíveis por tipo, não mais limitado a 20
- **Categorização Completa**: 13 categorias jurídicas diferentes extraídas diretamente do Excel
- **Conteúdo Autêntico**: Todas as questões mantêm texto original, opções, respostas corretas e explicações do Excel
- **Filtragem Funcional**: Sistema filtra corretamente por OAB_1_FASE (44) e CONCURSOS_MPSP (6)
- **Correção de Import**: Resolvido problema de carregamento TypeScript/JavaScript das questões
- **Sistema de Vidas Restaurado**: Jogo agora volta a ter 3 vidas, perdendo uma a cada erro
- **Tempo Aumentado**: Tempo por questão alterado de 20 segundos para 1 minuto (60 segundos)
- **Migração para PostgreSQL**: Todas as 50 questões do Excel agora salvas no banco de dados
- **Storage Atualizado**: Sistema agora usa DatabaseStorage em vez de MemStorage para carregamento das questões
- **Expansão Massiva**: 14.333 questões extraídas do novo Excel e 531 questões diversificadas migradas
- **Categorias Ampliadas**: 9 categorias jurídicas diferentes com 450 questões OAB + 81 questões CONCURSOS
- **Sistema de Rastreamento de Respostas**: Implementado armazenamento completo das respostas dos usuários no banco
- **Tabela user_answers**: Nova tabela para armazenar histórico detalhado de cada resposta do usuário
- **Estatísticas de Usuário**: Endpoints para consultar performance, acertos por categoria e tempo médio
- **Histórico de Sessões**: Capacidade de visualizar todas as respostas de uma sessão específica
- **Branding Atualizado**: "Powered by BIPETech" adicionado em todas as interfaces principais