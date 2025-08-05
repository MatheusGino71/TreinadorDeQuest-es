# Firebase Hosting Setup Guide

## Configuração Completa do Firebase

### 1. Pré-requisitos
- Firebase CLI já instalado no sistema
- Projeto Firebase configurado: `gameoab-45225`
- Build do projeto funcionando

### 2. Arquivos de Configuração

#### firebase.json
```json
{
  "hosting": {
    "public": "dist/public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "app"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### .firebaserc
```json
{
  "projects": {
    "default": "gameoab-45225"
  }
}
```

### 3. Scripts de Deploy

#### firebase-deploy.sh
Script automatizado para build e deploy:
```bash
chmod +x firebase-deploy.sh
./firebase-deploy.sh
```

### 4. Comandos Manuais

#### Login no Firebase
```bash
firebase login
```

#### Inicializar projeto (se necessário)
```bash
firebase init hosting
```

#### Build e Deploy
```bash
# Build do projeto
npm run build

# Deploy apenas hosting
firebase deploy --only hosting

# Deploy completo
firebase deploy
```

#### Servir localmente
```bash
npm run build
firebase serve
```

### 5. URLs do Projeto

- **Hosting URL**: https://gameoab-45225.web.app
- **Console Firebase**: https://console.firebase.google.com/project/gameoab-45225

### 6. Configuração de Domínio Personalizado

1. No Console Firebase, vá para Hosting
2. Clique em "Add custom domain"
3. Digite seu domínio personalizado
4. Siga as instruções para configurar DNS

### 7. Variáveis de Ambiente

Para produção no Firebase, certifique-se de configurar:
- DATABASE_URL
- SESSION_SECRET (se necessário)
- Outras variáveis de ambiente do projeto

### 8. Troubleshooting

#### Erro de Build
```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

#### Erro de Permissão
```bash
firebase login --reauth
```

#### Verificar Status
```bash
firebase projects:list
firebase hosting:sites:list
```

### 9. CI/CD Integration

Para automação com GitHub Actions, use:
```yaml
- name: Deploy to Firebase
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
    projectId: gameoab-45225
```

## Notas Importantes

- O Firebase Hosting serve arquivos estáticos do diretório `dist/public`
- As rotas da API precisam ser configuradas como Cloud Functions para funcionar em produção
- O sistema de autenticação Firebase já está integrado no projeto
- Certifique-se de que o build gera os arquivos na estrutura correta