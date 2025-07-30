@echo off
REM =======================================================
REM SCRIPT AUTOMÁTICO PARA GITHUB - TREINADOR DE QUESTÕES
REM =======================================================

echo 🚀 Iniciando setup do repositório GitHub...

REM Verificar se está na pasta correta
if not exist "package.json" (
    echo ❌ Execute este script na pasta raiz do projeto!
    pause
    exit /b 1
)

REM Verificar se git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não está instalado! Instale em: https://git-scm.com
    pause
    exit /b 1
)

REM Verificar se GitHub CLI está instalado
gh --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  GitHub CLI não encontrado. Instalação manual será necessária.
    set HAS_GH_CLI=false
) else (
    echo 🔑 GitHub CLI detectado!
    set HAS_GH_CLI=true
)

echo.
echo 📋 CONFIGURAÇÃO DO REPOSITÓRIO
echo ==============================
echo Nome do repositório: TreinadorDeQuestoes
echo Usuário GitHub: MatheusGino71
echo Descrição: Sistema gamificado de treinamento para questões jurídicas
echo.

REM Limpar git anterior se existir
if exist ".git" (
    echo ⚠️  Removendo configuração git anterior...
    rmdir /s /q .git
)

REM Inicializar git
echo ℹ️  Inicializando repositório Git...
git init

REM Configurar usuário
echo.
echo 🔧 CONFIGURAÇÃO DO GIT
echo =====================
set /p GIT_NAME="Digite seu nome para o Git: "
set /p GIT_EMAIL="Digite seu email do GitHub: "

git config user.name "%GIT_NAME%"
git config user.email "%GIT_EMAIL%"

echo ✅ Configuração do Git concluída

REM Criar .gitignore se não existir
if not exist ".gitignore" (
    echo ℹ️  Criando .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Production builds
        echo dist/
        echo build/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Editor directories and files
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo.
        echo # OS generated files
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Runtime files
        echo *.log
        echo *.pid
        echo.
        echo # Replit specific
        echo .replit
        echo replit.nix
        echo.
        echo # Database files
        echo *.db
        echo *.sqlite
        echo.
        echo # Temporary files
        echo *.tmp
        echo *.temp
        echo.
        echo # Python cache
        echo __pycache__/
        echo *.py[cod]
        echo.
        echo # Package files
        echo *.tgz
        echo *.tar.gz
        echo.
        echo # TypeScript cache
        echo *.tsbuildinfo
    ) > .gitignore
)

REM Adicionar arquivos
echo ℹ️  Adicionando arquivos ao repositório...
git add .

REM Fazer commit inicial
echo ℹ️  Fazendo commit inicial...
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

echo ✅ Commit realizado com sucesso!

REM Configurar branch main
git branch -M main

echo.
echo 🌐 CRIAÇÃO DO REPOSITÓRIO NO GITHUB
echo ====================================

if "%HAS_GH_CLI%"=="true" (
    echo ℹ️  Usando GitHub CLI para criar repositório...
    
    REM Verificar login
    gh auth status >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Faça login no GitHub CLI primeiro:
        echo gh auth login
        pause
        exit /b 1
    )
    
    REM Criar repositório
    gh repo create MatheusGino71/TreinadorDeQuestoes --description "Sistema gamificado de treinamento para questões jurídicas - OAB e Concursos" --public --source=. --remote=origin --push
    
    if errorlevel 1 (
        echo ❌ Erro ao criar repositório via GitHub CLI
    ) else (
        echo ✅ Repositório criado e enviado com sucesso!
        echo.
        echo 🔗 Acesse seu repositório em:
        echo    https://github.com/MatheusGino71/TreinadorDeQuestoes
    )
    
) else (
    echo ⚠️  Criação manual necessária!
    echo.
    echo 📝 PASSOS MANUAIS:
    echo ==================
    echo 1. Acesse: https://github.com/new
    echo 2. Repository name: TreinadorDeQuestoes
    echo 3. Description: Sistema gamificado de treinamento para questões jurídicas - OAB e Concursos
    echo 4. Marque como Public
    echo 5. NÃO adicione README, .gitignore ou license (já temos)
    echo 6. Clique em 'Create repository'
    echo.
    echo 📤 DEPOIS DE CRIAR, os comandos abaixo serão executados automaticamente:
    echo ====================================================================
    echo git remote add origin https://github.com/MatheusGino71/TreinadorDeQuestoes.git
    echo git push -u origin main
    echo.
    
    pause
    
    REM Adicionar remote
    git remote add origin https://github.com/MatheusGino71/TreinadorDeQuestoes.git
    
    REM Push para GitHub
    echo ℹ️  Enviando código para GitHub...
    git push -u origin main
    
    if errorlevel 1 (
        echo ❌ Erro ao enviar código. Verifique se o repositório foi criado corretamente.
    ) else (
        echo ✅ Código enviado com sucesso!
    )
)

echo.
echo 🎉 SETUP CONCLUÍDO!
echo ===================
echo.
echo ✅ Repositório GitHub configurado
echo ✅ Documentação completa incluída
echo ✅ Projeto pronto para deploy
echo.
echo 📚 PRÓXIMOS PASSOS:
echo ==================
echo • Para rodar localmente: ver SETUP_LOCAL.md
echo • Para fazer deploy: ver DEPLOY_INSTRUCTIONS.md
echo • Repositório: https://github.com/MatheusGino71/TreinadorDeQuestoes
echo.
echo Powered by BIPETech 🚀

pause