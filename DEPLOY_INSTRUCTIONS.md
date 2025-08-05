# 🚀 Instruções para Deploy no GitHub

## Passo a Passo para Subir no GitHub

### 1. Criar o Repositório
1. Acesse [GitHub.com](https://github.com)
2. Clique em "New repository"
3. Nome: `TreinadorDeQuestoes`
4. Descrição: "Sistema gamificado de treinamento para questões jurídicas - OAB e Concursos"
5. Marque como **Público**
6. ✅ Add README file
7. ✅ Add .gitignore (escolha "Node")
8. Clique em "Create repository"

### 2. Estrutura de Arquivos para Upload

Copie todos os arquivos do Replit para seu repositório, **EXCETO**:
- ❌ `.replit`
- ❌ `replit.nix` 
- ❌ `node_modules/`
- ❌ `dist/`
- ❌ `.env` (variáveis de ambiente)

### 3. Arquivo package.json Principal
Certifique-se de que o `package.json` na raiz tenha estes scripts:

```json
{
  "name": "treinador-de-questoes",
  "version": "1.0.0",
  "description": "Sistema gamificado de treinamento para questões jurídicas",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "preview": "vite preview",
    "db:push": "drizzle-kit push"
  }
}
```

### 4. Configuração do Banco de Dados
Para fazer o deploy, você precisará:

1. **Criar banco PostgreSQL** (recomendado: [Neon.tech](https://neon.tech))
2. **Configurar variáveis de ambiente**:
   ```env
   DATABASE_URL=sua_url_postgresql_completa
   PGHOST=seu_host
   PGPORT=5432
   PGUSER=seu_usuario
   PGPASSWORD=sua_senha
   PGDATABASE=nome_do_banco
   ```

3. **Migrar dados**:
   ```bash
   npm run db:push
   ```

### 5. Deploy Recomendado: Vercel

1. Conecte seu GitHub ao [Vercel.com](https://vercel.com)
2. Importe o repositório `TreinadorDeQuestoes`
3. Configure as variáveis de ambiente
4. Deploy automático!

### 6. Deploy Alternativo: Railway/Render

- **Railway**: Conecte GitHub → Configure env vars → Deploy
- **Render**: Conecte GitHub → Configure env vars → Deploy

## 📁 Estrutura Final do Repositório

```
TreinadorDeQuestoes/
├── README.md                    # Documentação principal
├── package.json                 # Dependências e scripts
├── .gitignore                   # Arquivos ignorados
├── tsconfig.json               # Configuração TypeScript
├── vite.config.ts              # Configuração Vite
├── tailwind.config.ts          # Configuração Tailwind
├── drizzle.config.ts           # Configuração banco
├── client/                     # Frontend React
│   ├── index.html
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
├── server/                     # Backend Node.js
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── db.ts
│   └── vite.ts
├── shared/                     # Tipos compartilhados
│   └── schema.ts
└── attached_assets/           # Arquivos Excel originais
    ├── Questões MC 1ª FASE e Concursos_*.xlsx
    └── image_*.png
```

## 🔐 Segurança

### Variáveis de Ambiente Obrigatórias
```env
# Database
DATABASE_URL=postgresql://usuario:senha@host:5432/database
PGHOST=seu_host_postgresql
PGPORT=5432
PGUSER=seu_usuario
PGPASSWORD=sua_senha_segura
PGDATABASE=nome_do_banco

# Optional for sessions (auto-generated if not provided)
SESSION_SECRET=sua_chave_secreta_longa_e_aleatoria
```

## 🚀 Comandos Úteis

```bash
# Instalar dependências
npm install

# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Push schema para banco
npm run db:push

# Preview da build
npm run preview
```

## 📞 Suporte

Se precisar de ajuda com:
- ✅ Configuração do banco de dados
- ✅ Deploy em plataformas específicas  
- ✅ Migração das questões
- ✅ Configuração de domínio customizado

Entre em contato ou abra uma issue no repositório!

---
**Powered by BIPETech** 🚀