#!/bin/bash

# =======================================================
# SCRIPT AUTOMÁTICO PARA GITHUB - TREINADOR DE QUESTÕES
# =======================================================

echo "🚀 Iniciando setup do repositório GitHub..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    log_error "Execute este script na pasta raiz do projeto!"
    exit 1
fi

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    log_error "Git não está instalado! Instale em: https://git-scm.com"
    exit 1
fi

# Verificar se GitHub CLI está instalado (opcional)
if command -v gh &> /dev/null; then
    echo "🔑 GitHub CLI detectado!"
    HAS_GH_CLI=true
else
    log_warning "GitHub CLI não encontrado. Instalação manual será necessária."
    HAS_GH_CLI=false
fi

echo ""
echo "📋 CONFIGURAÇÃO DO REPOSITÓRIO"
echo "=============================="
echo "Nome do repositório: TreinadorDeQuestoes"
echo "Usuário GitHub: MatheusGino71"
echo "Descrição: Sistema gamificado de treinamento para questões jurídicas"
echo ""

# Limpar git anterior se existir
if [ -d ".git" ]; then
    log_warning "Removendo configuração git anterior..."
    rm -rf .git
fi

# Inicializar git
log_info "Inicializando repositório Git..."
git init

# Configurar usuário (pedir confirmação)
echo ""
echo "🔧 CONFIGURAÇÃO DO GIT"
echo "====================="
read -p "Digite seu nome para o Git: " GIT_NAME
read -p "Digite seu email do GitHub: " GIT_EMAIL

git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

log_success "Configuração do Git concluída"

# Adicionar arquivos
log_info "Adicionando arquivos ao repositório..."

# Criar .gitignore se não existir
if [ ! -f ".gitignore" ]; then
    log_info "Criando .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
Thumbs.db

# Runtime files
*.log
*.pid

# Replit specific
.replit
replit.nix

# Database files
*.db
*.sqlite

# Temporary files
*.tmp
*.temp

# Python cache
__pycache__/
*.py[cod]

# Package files
*.tgz
*.tar.gz

# TypeScript cache
*.tsbuildinfo
EOF
fi

# Adicionar todos os arquivos
git add .

# Verificar se há arquivos para commit
if git diff --staged --quiet; then
    log_error "Nenhum arquivo para commit!"
    exit 1
fi

# Fazer commit inicial
log_info "Fazendo commit inicial..."
git commit -m "Initial commit: Treinador de Questões - Sistema completo

✅ Sistema de autenticação completo com login/registro
✅ 531 questões reais (450 OAB + 81 Concursos) 
✅ Gamificação: 3 vidas, power-ups, pontuação
✅ 20 questões por sessão com seleção aleatória
✅ Estatísticas detalhadas com análise de erros/acertos
✅ Interface responsiva com tema escuro
✅ PostgreSQL + Drizzle ORM
✅ React + TypeScript + Tailwind CSS
✅ Documentação completa para setup local
✅ Powered by BIPETech"

log_success "Commit realizado com sucesso!"

# Configurar branch main
git branch -M main

echo ""
echo "🌐 CRIAÇÃO DO REPOSITÓRIO NO GITHUB"
echo "===================================="

if [ "$HAS_GH_CLI" = true ]; then
    log_info "Usando GitHub CLI para criar repositório..."
    
    # Fazer login se necessário
    if ! gh auth status &> /dev/null; then
        log_warning "Faça login no GitHub CLI primeiro:"
        echo "gh auth login"
        exit 1
    fi
    
    # Criar repositório
    gh repo create MatheusGino71/TreinadorDeQuestoes \
        --description "Sistema gamificado de treinamento para questões jurídicas - OAB e Concursos" \
        --public \
        --source=. \
        --remote=origin \
        --push
        
    if [ $? -eq 0 ]; then
        log_success "Repositório criado e enviado com sucesso!"
        echo ""
        echo "🔗 Acesse seu repositório em:"
        echo "   https://github.com/MatheusGino71/TreinadorDeQuestoes"
    else
        log_error "Erro ao criar repositório via GitHub CLI"
    fi
    
else
    log_warning "Criação manual necessária!"
    echo ""
    echo "📝 PASSOS MANUAIS:"
    echo "=================="
    echo "1. Acesse: https://github.com/new"
    echo "2. Repository name: TreinadorDeQuestoes"
    echo "3. Description: Sistema gamificado de treinamento para questões jurídicas - OAB e Concursos"
    echo "4. Marque como Public"
    echo "5. NÃO adicione README, .gitignore ou license (já temos)"
    echo "6. Clique em 'Create repository'"
    echo ""
    echo "📤 DEPOIS DE CRIAR, EXECUTE:"
    echo "============================"
    echo "git remote add origin https://github.com/MatheusGino71/TreinadorDeQuestoes.git"
    echo "git push -u origin main"
    echo ""
    
    read -p "Pressione ENTER após criar o repositório no GitHub..." -r
    
    # Adicionar remote
    git remote add origin https://github.com/MatheusGino71/TreinadorDeQuestoes.git
    
    # Push para GitHub
    log_info "Enviando código para GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        log_success "Código enviado com sucesso!"
    else
        log_error "Erro ao enviar código. Verifique se o repositório foi criado corretamente."
    fi
fi

echo ""
echo "🎉 SETUP CONCLUÍDO!"
echo "==================="
echo ""
log_success "Repositório GitHub configurado"
log_success "Documentação completa incluída"
log_success "Projeto pronto para deploy"
echo ""
echo "📚 PRÓXIMOS PASSOS:"
echo "=================="
echo "• Para rodar localmente: ver SETUP_LOCAL.md"
echo "• Para fazer deploy: ver DEPLOY_INSTRUCTIONS.md"
echo "• Repositório: https://github.com/MatheusGino71/TreinadorDeQuestoes"
echo ""
echo "Powered by BIPETech 🚀"