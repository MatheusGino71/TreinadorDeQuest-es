# 🏠 RODAR NO LOCALHOST - GUIA COMPLETO

## Resumo Rápido

O projeto já está rodando aqui no Replit, mas para rodar no seu computador local:

### Windows:
```bash
# 1. Instalar Node.js (se não tiver)
# Baixe em: https://nodejs.org

# 2. Baixar projeto do Replit
# Clique nos 3 pontinhos → Download as ZIP

# 3. Extrair e navegar para a pasta
cd TreinadorDeQuestoes

# 4. Instalar dependências
npm install

# 5. Configurar banco (PostgreSQL)
# Editar .env com sua configuração

# 6. Migrar banco
npm run db:push

# 7. Rodar projeto
npm run dev

# 8. Acessar
# http://localhost:5000
```

## Pré-requisitos

### 1. Node.js 18+
- **Download**: [nodejs.org](https://nodejs.org)
- **Verificar**: `node --version`

### 2. PostgreSQL
Escolha uma opção:

#### Opção A: PostgreSQL Local
- **Windows**: [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt install postgresql`

#### Opção B: Banco na Nuvem (Mais Fácil)
- **Neon.tech**: [neon.tech](https://neon.tech) - Grátis
- **Supabase**: [supabase.com](https://supabase.com) - Grátis
- **Railway**: [railway.app](https://railway.app) - Grátis

## Configuração Detalhada

### 1. Baixar Projeto
```bash
# Opção A: Do GitHub (se já subiu)
git clone https://github.com/MatheusGino71/TreinadorDeQuestoes.git
cd TreinadorDeQuestoes

# Opção B: Download ZIP do Replit
# 1. Clique nos 3 pontinhos no painel de arquivos
# 2. "Download as ZIP"
# 3. Extrair para uma pasta
# 4. Abrir terminal na pasta
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Banco de Dados

#### Criar arquivo .env:
```env
# PostgreSQL Local
DATABASE_URL=postgresql://postgres:senha123@localhost:5432/treinador_questoes
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=senha123
PGDATABASE=treinador_questoes

# OU PostgreSQL na Nuvem (Neon.tech)
# DATABASE_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require

# Chave para sessões (opcional)
SESSION_SECRET=minha_chave_secreta_super_longa_e_aleatoria
```

### 4. Preparar Banco
```bash
# Criar as tabelas e migrar dados
npm run db:push
```

Isso criará:
- ✅ Tabela `users` (usuários)
- ✅ Tabela `questions` (531 questões)
- ✅ Tabela `game_session` (sessões)
- ✅ Tabela `user_answers` (respostas)

### 5. Rodar Projeto
```bash
# Modo desenvolvimento
npm run dev
```

**Acesse**: http://localhost:5000

## URLs do Localhost

- **Página Principal**: http://localhost:5000
- **Login**: http://localhost:5000 (redireciona automaticamente)
- **Jogo OAB**: Após login, selecionar "OAB 1ª FASE"
- **Jogo Concursos**: Após login, selecionar "CONCURSOS"

## Verificar se Funcionou

### 1. Terminal deve mostrar:
```
[express] serving on port 5000
Getting questions count...
Questions count: { OAB_1_FASE: 450, CONCURSOS_MPSP: 81, total: 531 }
```

### 2. No navegador:
- ✅ Página de login carrega
- ✅ Pode criar conta
- ✅ Pode fazer login
- ✅ Tela de preparação aparece
- ✅ Jogo funciona com questões reais
- ✅ Estatísticas aparecem corretamente

## Configuração PostgreSQL Local

### Windows (PostgreSQL local):

1. **Baixar**: [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. **Instalar** com senha master (ex: `postgres123`)
3. **Abrir pgAdmin** ou Command Prompt
4. **Criar banco**:
   ```sql
   CREATE DATABASE treinador_questoes;
   ```
5. **Configurar .env**:
   ```env
   DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/treinador_questoes
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=postgres123
   PGDATABASE=treinador_questoes
   ```

### Mac (PostgreSQL local):
```bash
# Instalar
brew install postgresql

# Iniciar serviço
brew services start postgresql

# Criar banco
createdb treinador_questoes

# Configurar .env (igual ao Windows)
```

### Linux (PostgreSQL local):
```bash
# Instalar
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar
sudo systemctl start postgresql

# Criar banco
sudo -u postgres createdb treinador_questoes

# Configurar .env (igual ao Windows)
```

## Banco na Nuvem (Neon.tech - Recomendado)

### Por que usar Neon.tech:
- ✅ **Grátis**: Até 10GB
- ✅ **Fácil**: Só criar conta e copiar URL
- ✅ **Rápido**: Sem instalação local
- ✅ **Confiável**: Backup automático

### Passos:
1. **Criar conta**: [neon.tech](https://neon.tech)
2. **Criar projeto**: "Treinador de Questões"
3. **Copiar URL**: `postgresql://usuario:senha@host.neon.tech/database?sslmode=require`
4. **Configurar .env**:
   ```env
   DATABASE_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require
   ```

## Solução de Problemas

### Erro: "Port 5000 already in use"
```bash
# Matar processo na porta 5000
npx kill-port 5000

# OU mudar porta no server/index.ts
const PORT = 3000; // Usar 3000 em vez de 5000
```

### Erro: "Cannot connect to database"
1. **Verificar PostgreSQL rodando**:
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # Mac
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```
2. **Verificar .env** com dados corretos
3. **Testar conexão**: Usar pgAdmin ou DBeaver

### Erro: "Questions not loading"
1. **Rodar migração**: `npm run db:push`
2. **Verificar logs**: Console do terminal
3. **Verificar banco**: Tabela `questions` deve ter 531 registros

### Erro: "Module not found"
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Performance no Localhost

### Para desenvolvimento:
- **Hot reload**: Ativado automaticamente
- **Debug**: Console logs detalhados
- **Database**: SQLite local para testes rápidos

### Para produção local:
```bash
# Build otimizada
npm run build

# Rodar em produção
npm start
```

## Comandos Úteis

```bash
# Ver logs detalhados
DEBUG=* npm run dev

# Verificar banco
npm run db:push --verbose

# Limpar cache
npm run clean  # (se existir)

# Backup banco local
pg_dump treinador_questoes > backup.sql

# Verificar porta ocupada
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux
```

## Estrutura no Localhost

```
TreinadorDeQuestoes/
├── .env                    # Configuração local
├── node_modules/           # Dependências instaladas
├── dist/                   # Build de produção
├── package.json           # Scripts e dependências
├── client/                # Frontend React
├── server/                # Backend Node.js
├── shared/                # Tipos compartilhados
└── attached_assets/       # Assets originais
```

## Próximos Passos

Após rodar no localhost:

1. **Testar todas funcionalidades**
2. **Fazer backup do banco** com seus dados
3. **Personalizar conforme necessário**
4. **Fazer deploy** em Vercel/Railway quando pronto

**Localhost funcionando = Projeto 100% seu!**

---
**Powered by BIPETech** 🚀