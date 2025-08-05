# 🏠 Como Rodar o Treinador de Questões Localmente

## Pré-requisitos

### 1. Instalar Node.js
- Baixe em [nodejs.org](https://nodejs.org)
- Versão recomendada: **18.x ou superior**
- Verifique a instalação: `node --version`

### 2. Ter um Banco PostgreSQL
Opções disponíveis:

#### Opção A: PostgreSQL Local
- Baixe em [postgresql.org](https://postgresql.org/download)
- Crie um banco de dados: `createdb treinador_questoes`

#### Opção B: Banco na Nuvem (Recomendado)
- **Neon.tech** (grátis): [neon.tech](https://neon.tech)
- **Supabase** (grátis): [supabase.com](https://supabase.com)
- **Railway** (grátis): [railway.app](https://railway.app)

## Passo a Passo

### 1. Baixar o Projeto
```bash
# Se estiver no GitHub
git clone https://github.com/MatheusGino71/TreinadorDeQuestoes.git
cd TreinadorDeQuestoes

# Ou baixar ZIP e extrair
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração do Banco PostgreSQL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/treinador_questoes

# OU se usar banco na nuvem:
# DATABASE_URL=postgresql://usuario:senha@host:5432/database

# Configurações específicas do PostgreSQL
PGHOST=localhost
PGPORT=5432
PGUSER=seu_usuario
PGPASSWORD=sua_senha
PGDATABASE=treinador_questoes

# Chave secreta para sessões (opcional - será gerada automaticamente se não fornecida)
SESSION_SECRET=sua_chave_secreta_super_longa_e_aleatoria_aqui
```

### 4. Preparar o Banco de Dados
```bash
# Enviar schema para o banco
npm run db:push
```

Isso criará todas as tabelas necessárias:
- `users` (usuários)
- `questions` (questões)
- `game_session` (sessões de jogo)
- `user_answers` (respostas dos usuários)

### 5. Rodar o Projeto
```bash
# Modo desenvolvimento
npm run dev
```

Acesse: **http://localhost:5000**

## Estrutura dos Comandos

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build", 
  "preview": "vite preview",
  "db:push": "drizzle-kit push"
}
```

## Configuração Detalhada

### Banco PostgreSQL Local (Windows)

1. **Baixar PostgreSQL**: [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. **Instalar** com senha master
3. **Abrir pgAdmin** ou terminal
4. **Criar banco**:
   ```sql
   CREATE DATABASE treinador_questoes;
   ```
5. **Configurar .env**:
   ```env
   DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/treinador_questoes
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=sua_senha
   PGDATABASE=treinador_questoes
   ```

### Banco PostgreSQL Local (Mac/Linux)

1. **Instalar PostgreSQL**:
   ```bash
   # Mac (com Homebrew)
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Criar banco**:
   ```bash
   sudo -u postgres createdb treinador_questoes
   ```

3. **Configurar .env** (mesmo que Windows)

### Banco na Nuvem (Neon.tech)

1. **Criar conta** em [neon.tech](https://neon.tech)
2. **Criar novo projeto**
3. **Copiar string de conexão**
4. **Configurar .env**:
   ```env
   DATABASE_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require
   ```

## Migração das Questões

Quando rodar `npm run db:push`, as questões serão automaticamente carregadas se não existirem. O sistema contém:

- **450 questões OAB 1ª FASE**
- **81 questões CONCURSOS MPSP**  
- **Total: 531 questões autênticas**

## Solução de Problemas Comuns

### Erro de Conexão com Banco
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solução**: Verificar se PostgreSQL está rodando
```bash
# Windows
net start postgresql-x64-14

# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Erro de Permissões
```
Error: permission denied for database
```
**Solução**: Verificar usuário e senha no .env

### Porta já em uso
```
Error: Port 5000 is already in use
```
**Solução**: Matar processo ou mudar porta:
```bash
# Encontrar processo na porta 5000
npx kill-port 5000

# Ou editar server/index.ts para usar outra porta
const PORT = process.env.PORT || 3000;
```

### Questões não carregam
**Solução**: Verificar se `npm run db:push` foi executado com sucesso

## Performance e Otimização

### Para Produção
```bash
# Build otimizada
npm run build

# Servir arquivos estáticos
npm run preview
```

### Variáveis de Ambiente Produção
```env
NODE_ENV=production
DATABASE_URL=sua_url_postgresql_producao
SESSION_SECRET=chave_super_segura_para_producao
```

## Estrutura de Arquivos Local

```
TreinadorDeQuestoes/
├── .env                    # ⚠️ Não commitar no Git
├── package.json
├── node_modules/           # Criado pelo npm install
├── dist/                   # Criado pelo npm run build
├── client/                 # Frontend React
├── server/                 # Backend Node.js  
├── shared/                 # Tipos compartilhados
└── attached_assets/        # Arquivos Excel originais
```

## Comandos Úteis

```bash
# Limpar dependências e reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar status do banco
npm run db:push --verbose

# Ver logs detalhados
NODE_ENV=development DEBUG=* npm run dev

# Backup do banco
pg_dump treinador_questoes > backup.sql

# Restaurar backup
psql treinador_questoes < backup.sql
```

## Suporte

Se encontrar problemas:

1. **Verificar logs**: Console do navegador e terminal
2. **Verificar .env**: Todas as variáveis configuradas
3. **Verificar banco**: Conexão funcionando
4. **Verificar Node.js**: Versão 18+ instalada

**Tudo funcionando?** Acesse http://localhost:5000 e comece a jogar!

---
**Powered by BIPETech** 🚀