import { db } from "./server/db";
import { questions } from "./shared/schema";
import { questionsFromExcel } from "./server/questions-data.js";

async function migrateQuestions() {
  console.log('🚀 Iniciando migração das questões do Excel para o banco de dados...');
  
  try {
    // Limpar questões existentes
    console.log('🗑️  Limpando questões existentes no banco...');
    await db.delete(questions);
    
    // Inserir todas as questões do Excel
    console.log(`📝 Inserindo ${questionsFromExcel.length} questões do Excel...`);
    
    const insertedQuestions = await db.insert(questions).values(
      questionsFromExcel.map((q, index) => ({
        id: `Q${String(index + 1).padStart(3, '0')}`,
        text: q.text,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        difficulty: q.difficulty,
        category: q.category,
        challengeType: q.challengeType,
        explanation: q.explanation || `Questão ${index + 1} do arquivo Excel`
      }))
    ).returning();
    
    console.log(`✅ ${insertedQuestions.length} questões salvas no banco de dados!`);
    
    // Verificar dados inseridos
    const totalQuestions = await db.select().from(questions);
    const oabQuestions = totalQuestions.filter(q => q.challengeType === 'OAB_1_FASE');
    const concursosQuestions = totalQuestions.filter(q => q.challengeType?.includes('CONCURSOS'));
    
    console.log('\n📊 RESUMO DA MIGRAÇÃO:');
    console.log(`  Total no banco: ${totalQuestions.length} questões`);
    console.log(`  OAB 1ª FASE: ${oabQuestions.length} questões`);
    console.log(`  CONCURSOS: ${concursosQuestions.length} questões`);
    
    // Listar categorias
    const categories = [...new Set(totalQuestions.map(q => q.category))];
    console.log('\n📚 CATEGORIAS SALVAS:');
    categories.forEach(cat => {
      const count = totalQuestions.filter(q => q.category === cat).length;
      console.log(`  ${cat}: ${count} questões`);
    });
    
    console.log('\n🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Executar migração
migrateQuestions()
  .then(() => {
    console.log('✅ Script finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });