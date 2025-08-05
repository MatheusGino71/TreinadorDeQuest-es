# 🚀 Guia de Deploy Firebase - Treinador de Questões

Este guia mostra como fazer deploy da sua aplicação no Firebase Hosting.

## 📋 Pré-requisitos

- ✅ Firebase CLI instalado (`npm install -g firebase-tools`)
- ✅ Projeto Firebase configurado (`treinador-de-questoes`)
- ✅ Conta Google com acesso ao projeto Firebase

## 🔐 1. Login no Firebase

```bash
# Fazer login no Firebase
npm run firebase:login
# ou
firebase login
```

## 🏗️ 2. Build da Aplicação

```bash
# Build apenas do cliente (React)
npm run build:client

# Build completo (cliente + servidor)
npm run build
```

## 🚀 3. Deploy

### Deploy Completo (Hosting + Rules)
```bash
npm run firebase:deploy
```

### Deploy Apenas do Hosting
```bash
npm run firebase:deploy:hosting
```

### Deploy Apenas das Regras (Firestore + Storage)
```bash
npm run firebase:deploy:rules
```

### Deploy Manual
```bash
# Build primeiro
npm run build:client

# Deploy
firebase deploy
```

## 🧪 4. Teste Local (Firebase Emulator)

```bash
# Servir localmente com Firebase
npm run firebase:serve

# Ou diretamente
firebase serve
```

## 📁 5. Estrutura de Deploy

```
dist/                     # Pasta de build (gerada automaticamente)
├── index.html           # Página principal
├── assets/              # CSS, JS, imagens
│   ├── index-[hash].js  # JavaScript bundled
│   └── index-[hash].css # CSS bundled
├── favicon.ico          # Ícone
└── ...                  # Outros arquivos estáticos

firebase.json            # Configuração do Firebase
.firebaserc             # Projeto padrão
firestore.rules         # Regras do Firestore
storage.rules           # Regras do Storage
```

## ⚙️ 6. Configuração do Firebase (firebase.json)

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## 🔒 7. Configuração de Segurança

### Firestore Rules (firestore.rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem acessar seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Questões são públicas para usuários autenticados
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules (storage.rules)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Uploads organizados por usuário
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🌐 8. URLs após Deploy

Após o deploy bem-sucedido, você terá:

- **Hosting URL**: `https://treinador-de-questoes.web.app`
- **Custom Domain** (opcional): `https://seudominio.com`

## 📊 9. Monitoramento

### Ver logs do deploy
```bash
firebase functions:log
```

### Ver status do projeto
```bash
firebase projects:list
firebase use --info
```

### Analytics no Console
- Acesse: https://console.firebase.google.com/project/treinador-de-questoes
- Analytics > Dashboard

## 🔧 10. Scripts Úteis

```bash
# Ver versão do Firebase CLI
firebase --version

# Ver projetos disponíveis
firebase projects:list

# Mudar projeto ativo
firebase use outro-projeto

# Validar regras antes do deploy
firebase firestore:rules:validate

# Deploy apenas de regras específicas
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only hosting
```

## 🚨 11. Troubleshooting

### Erro: "Firebase project not found"
```bash
firebase use treinador-de-questoes
```

### Erro: "Build failed"
```bash
# Limpar cache e reinstalar
rm -rf node_modules dist
npm install
npm run build:client
```

### Erro: "Permission denied"
```bash
# Fazer login novamente
firebase logout
firebase login
```

### Erro: "Hosting deploy failed"
```bash
# Verificar se o diretório dist existe
ls -la dist/
# Se não existir, fazer build
npm run build:client
```

## 🎯 12. Próximos Passos

1. **Configurar Domínio Personalizado**
   - Firebase Console > Hosting > Add custom domain

2. **Configurar CI/CD**
   - GitHub Actions para deploy automático
   - Deploy em branches específicas

3. **Configurar Environment Variables**
   - Diferentes configs para dev/prod
   - Chaves de API seguras

4. **Monitoramento e Analytics**
   - Google Analytics
   - Firebase Performance Monitoring
   - Error Reporting

## ✅ 13. Checklist de Deploy

- [ ] Firebase CLI instalado
- [ ] Login no Firebase realizado
- [ ] Build da aplicação bem-sucedido
- [ ] Regras de segurança configuradas
- [ ] Deploy realizado sem erros
- [ ] URL funcionando corretamente
- [ ] Autenticação testada em produção
- [ ] Firestore funcionando em produção
- [ ] Storage funcionando (se usado)

---

**🎉 Seu app está pronto para o mundo!**

URL de produção: `https://treinador-de-questoes.web.app`
