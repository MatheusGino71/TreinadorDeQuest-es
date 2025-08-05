# 🎮 Configuração Localhost - Treinador de Questões

## Status: Projeto Funcionando ✅

O jogo está rodando perfeitamente no Replit e pode ser configurado para localhost seguindo estas instruções.

## 📋 Pré-requisitos

### Instalações Necessárias
- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (local ou remoto)
- **Git** (para clonar o projeto)

## 🚀 Setup Localhost

### 1. Clonar/Baixar Projeto
```bash
# Se usando Git
git clone [URL_DO_REPOSITORIO]
cd treinador-questoes

# Ou baixar arquivos manualmente
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Banco de Dados

#### Opção A: PostgreSQL Local
```bash
# Instalar PostgreSQL
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Baixar do site oficial
```

#### Opção B: Usar Neon Database (Recomendado)
- Criar conta em https://neon.tech
- Criar novo projeto
- Copiar string de conexão

### 4. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env na raiz do projeto
cp .env.example .env
```

#### Conteúdo do .env
```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/treinador_questoes"

# OU usar Neon Database
DATABASE_URL="postgresql://usuario:senha@ep-xxx.neon.tech/neondb?sslmode=require"

# Session
SESSION_SECRET="seu_secret_super_seguro_aqui"

# Firebase (opcional)
VITE_FIREBASE_API_KEY="sua_api_key"
VITE_FIREBASE_AUTH_DOMAIN="gameoab-45225.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="gameoab-45225"
# ... outras configs Firebase
```

### 5. Configurar Banco de Dados
```bash
# Migrar schema para o banco
npm run db:push
```

### 6. Executar em Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

### 7. Acessar Aplicação
```
http://localhost:5000
```

## 🗄️ Estrutura do Banco

### Tabelas Criadas Automaticamente
- `users` - Usuários do sistema
- `questions` - Banco de questões jurídicas
- `game_sessions` - Sessões de jogo
- `user_answers` - Respostas dos usuários
- `sessions` - Sessões de autenticação

### Dados Incluídos
- **450 questões OAB 1ª Fase**
- **105 questões Concursos MPSP**
- **9 disciplinas jurídicas**

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Migrar banco
npm run db:push

# Verificar TypeScript
npm run check
```

## 🌐 URLs Localhost

### Aplicação Principal
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api

### Páginas Disponíveis
- `/` - Login e jogo principal
- `/firebase` - Login Firebase
- `/course-selection` - Seleção de disciplinas
- `/game` - Interface do jogo
- `/admin` - Dashboard administrativo

## 🎯 Funcionalidades Localhost

### ✅ Funcionará Completamente
- Sistema de login tradicional
- Banco completo de questões
- Jogo com 20 questões por sessão
- Sistema de vidas e power-ups
- Estatísticas detalhadas
- Dashboard administrativo
- Autenticação Firebase (se configurado)

### 🔐 Sistema Admin
- **URL**: http://localhost:5000/admin
- **Login**: admin@admin.com
- **Senha**: admin123
- Gerenciamento completo de usuários

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql $DATABASE_URL
```

### Erro de Dependências
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
```

### Erro de Porta
```bash
# Se porta 5000 estiver ocupada
lsof -ti:5000 | xargs kill -9
```

### Logs de Debug
```bash
# Ver logs do servidor
NODE_ENV=development npm run dev
```

## 📊 Performance Localhost

### Vantagens
- Acesso direto ao banco
- Sem limitações de rede
- Debug completo
- Desenvolvimento mais rápido

### Configurações Recomendadas
- PostgreSQL local para melhor performance
- SSD para banco de dados
- Mínimo 4GB RAM

## 🚀 Deploy Local para Produção

### Build
```bash
npm run build
```

### Produção
```bash
NODE_ENV=production npm start
```

### Com PM2 (Recomendado)
```bash
npm install -g pm2
pm2 start dist/index.js --name "treinador-questoes"
```

---

## ✅ Resumo Setup

1. **Instalar**: Node.js + PostgreSQL
2. **Clonar**: Projeto do repositório
3. **Instalar**: `npm install`
4. **Configurar**: Arquivo `.env`
5. **Migrar**: `npm run db:push`
6. **Executar**: `npm run dev`
7. **Acessar**: http://localhost:5000

**Projeto funcionará 100% em localhost!**