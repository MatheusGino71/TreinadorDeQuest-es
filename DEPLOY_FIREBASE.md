# Deploy Firebase - Passo a Passo

## 🚀 Como fazer deploy do Treinador de Questões no Firebase Hosting

### Pré-requisitos ✅
- ✅ Firebase CLI instalado
- ✅ Projeto Firebase configurado (gameoab-45225)
- ✅ Arquivos de configuração criados
- ✅ Build funcionando

### Passo 1: Login no Firebase
```bash
firebase login
```
*Siga as instruções no navegador para autenticar*

### Passo 2: Verificar configuração
```bash
firebase projects:list
```
*Confirme que o projeto gameoab-45225 está listado*

### Passo 3: Build do projeto
```bash
npm run build
```
*Aguarde o build completar sem erros*

### Passo 4: Deploy automático
```bash
./firebase-deploy.sh
```
*Ou manualmente:*
```bash
firebase deploy --only hosting
```

### Passo 5: Verificar deploy
Após o deploy, seu site estará disponível em:
- **URL Principal**: https://gameoab-45225.web.app
- **URL Alternativa**: https://gameoab-45225.firebaseapp.com

## 🔧 Configuração Atual

### Estrutura de Arquivos
```
projeto/
├── firebase.json (configuração hosting)
├── .firebaserc (projeto default)
├── firebase-deploy.sh (script automático)
├── dist/
│   ├── public/ (arquivos estáticos)
│   └── index.js (servidor)
```

### Firebase Configuration
- **Project ID**: gameoab-45225
- **Hosting Directory**: dist/public
- **SPA Rewrite**: Todas rotas → index.html
- **API Routes**: /api/** (requer Cloud Functions)

## 🎮 Funcionalidades Disponíveis no Deploy

### Sistema de Autenticação
- ✅ Login tradicional (PostgreSQL)
- ✅ Firebase Authentication
- ✅ Navegação entre sistemas

### Jogo
- ✅ 450 questões OAB 1ª Fase
- ✅ 105 questões Concursos MPSP
- ✅ 9 disciplinas jurídicas
- ✅ Sistema de vidas e power-ups
- ✅ Estatísticas completas

### Interface
- ✅ Design responsivo
- ✅ Tema escuro
- ✅ Componentes acessíveis

## ⚠️ Importantes

### Para Funcionalidade Completa
- O backend (API) precisa ser configurado como Cloud Functions
- Variáveis de ambiente devem ser configuradas no Firebase
- Banco de dados PostgreSQL precisa estar acessível

### Apenas Frontend (Estático)
- Funciona: Interface, navegação, Firebase Auth
- Não funciona: API calls, questões do banco, estatísticas

## 🛠️ Próximos Passos Recomendados

1. **Deploy Estático** (Imediato)
   - `firebase deploy --only hosting`
   - Testa interface e Firebase Auth

2. **Cloud Functions** (Para funcionalidade completa)
   - Configurar functions no firebase.json
   - Migrar API endpoints para Cloud Functions
   - Configurar variáveis de ambiente

3. **Domínio Personalizado**
   - Adicionar domínio no console Firebase
   - Configurar DNS

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `firebase functions:log`
2. Testar local: `firebase serve`
3. Reautenticar: `firebase login --reauth`

---
*Configurado em: February 5, 2025*
*Projeto: Treinador de Questões - Sistema Jurídico*