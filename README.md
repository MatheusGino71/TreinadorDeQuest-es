# 🚀 Treinador de Questões - Sistema Jurídico com Firebase

Um sistema gamificado moderno para treinamento de questões jurídicas, agora com **Firebase Authentication** e funcionalidade **100% offline**.

## ✨ Funcionalidades Principais

### 🔐 **Autenticação Firebase**
- Login com email e senha
- Login social com Google
- Registro de novos usuários
- Recuperação de senha
- Validação de formulários

### 🎮 **Sistema de Jogo Offline**
- **10 questões por partida** (seleção aleatória)
- **Timer de 60 segundos** por questão
- **Sistema de pontuação** com streaks
- **Power-ups**: Dica, Eliminar opções, Pular questão
- **Estatísticas completas** ao final

### 📚 **Modalidades Disponíveis**
- **OAB 1ª Fase**: Questões específicas do exame
- **Concursos**: Questões de concursos públicos
- Categorias: Direito Civil, Penal, Constitucional, etc.

### 🎯 **Interface Moderna**
- Design responsivo e atrativo
- Animações suaves
- Feedback visual imediato
- Tema escuro/gradiente

## 🛠 Tecnologias

### **Frontend**
- **React 18** + TypeScript
- **Firebase SDK** (Auth, Firestore, Storage)
- **Tailwind CSS** + shadcn/ui components
- **Vite** para build otimizado
- **TanStack Query** para gerenciamento de estado

### **Hospedagem & Deploy**
- **Firebase Hosting** para frontend
- **Firebase Authentication** para usuários
- **Firestore Database** (configurado)
- **Firebase Storage** (disponível)

## 🚀 Deploy & Acesso

### **Aplicação Online**
🌐 **URL**: https://treinador-de-questoes.web.app

### **Status do Projeto**
- ✅ **Login funcionando** (Firebase Auth)
- ✅ **Jogo offline completo**
- ✅ **Interface 100% responsiva**
- ✅ **Deploy automatizado**
- ✅ **Pronto para produção**

## 📁 Estrutura do Projeto

```
TreinadorDeQuestoes/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes UI
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── hooks/            # Hooks personalizados
│   │   ├── lib/              # Configurações (Firebase, etc)
│   │   └── data/             # Dados estáticos (questões)
│   └── dist/public/          # Build de produção
├── firebase.json              # Configuração Firebase
├── .firebaserc               # Projeto Firebase
└── README.md                 # Este arquivo
```

## 🎯 Características do Jogo

### **Mecânica de Pontuação**
- **100 pontos** por resposta correta
- **Bonus de streak** para respostas consecutivas
- **Penalty** por timeout (reset do streak)

### **Power-ups Estratégicos**
- **💡 Dica**: Mostra explicação da questão
- **⚡ Eliminar**: Remove 2 opções incorretas
- **⏭️ Pular**: Avança sem penalty

### **Estatísticas Finais**
- Pontuação total alcançada
- Número de acertos/total
- Percentual de precisão
- Maior sequência de acertos

## 🔧 Configuração Local

### **Pré-requisitos**
- Node.js 18+
- Firebase CLI
- Git

### **Instalação**
```bash
# Clone o repositório
git clone https://github.com/MatheusGino71/TreinadorDeQuest-es.git
cd TreinadorDeQuest-es

# Instale dependências
npm install

# Configure Firebase (opcional - já configurado)
firebase login
firebase init

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy para Firebase
firebase deploy
```

## 📋 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
firebase serve       # Servidor local Firebase
firebase deploy      # Deploy para produção
```

## 🔥 Firebase Configuration

### **Serviços Ativados**
- ✅ Authentication (Email/Password + Google)
- ✅ Hosting (Static files)
- ✅ Firestore Database (NoSQL)
- ✅ Storage (File uploads)

### **Regras de Segurança**
- Firestore: Usuários autenticados podem ler/escrever
- Storage: Upload apenas para usuários logados
- Authentication: Registro público habilitado

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:
- 💻 **Desktop** (1920x1080+)
- 💻 **Laptop** (1366x768+)
- 📱 **Tablet** (768x1024+)
- 📱 **Mobile** (360x640+)

## 🎨 Design System

### **Cores Principais**
- **Primary**: Gradiente azul-roxo
- **Secondary**: Tons de cinza
- **Accent**: Amarelo/dourado
- **Success**: Verde
- **Error**: Vermelho

### **Tipografia**
- **Font**: Inter (system fallback)
- **Tamanhos**: rem scaling
- **Weights**: 400, 500, 600, 700

## 🐛 Troubleshooting

### **Problemas Comuns**
1. **Erro de build**: Execute `npm install` novamente
2. **Firebase não conecta**: Verifique configuração em `firebase.ts`
3. **Deploy falha**: Confirme permissões do projeto Firebase

### **Logs e Debug**
- Console do navegador para erros frontend
- Firebase Console para logs de autenticação
- Network tab para problemas de conectividade

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Matheus Gino**
- GitHub: [@MatheusGino71](https://github.com/MatheusGino71)
- Projeto: [TreinadorDeQuest-es](https://github.com/MatheusGino71/TreinadorDeQuest-es)

---

**🎯 Status: Projeto 100% funcional e pronto para uso!**

**🌐 Acesse agora: https://treinador-de-questoes.web.app**
