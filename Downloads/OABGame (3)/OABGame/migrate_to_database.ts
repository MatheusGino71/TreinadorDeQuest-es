import { db } from "./server/db";
import { questions } from "./shared/schema";
import questionsData from "./questions_diverse_sample.json";

async function migrateQuestionsToDatabase() {
  console.log('🚀 Iniciando migração das questões do Excel para PostgreSQL...');
  
  try {
    // Limpar questões existentes
    console.log('🗑️  Limpando questões existentes...');
    await db.delete(questions);
    
    console.log(`📝 Inserindo ${questionsData.length} questões no banco...`);
    
    // Inserir questões em lotes para melhor performance
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < questionsData.length; i += batchSize) {
      const batch = questionsData.slice(i, i + batchSize);
      
      const insertedBatch = await db.insert(questions).values(
        batch.map((q: any) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          difficulty: q.difficulty,
          category: q.category,
          challengeType: q.challengeType,
          explanation: q.explanation
        }))
      ).returning();
      
      totalInserted += insertedBatch.length;
      console.log(`  ✅ Lote ${Math.floor(i/batchSize) + 1}: ${insertedBatch.length} questões inseridas`);
    }
    
    // Verificar dados inseridos
    const allQuestions = await db.select().from(questions);
    const oabQuestions = allQuestions.filter(q => q.challengeType === 'OAB_1_FASE');
    const concursosQuestions = allQuestions.filter(q => q.challengeType?.includes('CONCURSOS'));
    
    console.log('\n📊 RESUMO DA MIGRAÇÃO:');
    console.log(`  Total inserido: ${totalInserted} questões`);
    console.log(`  Total no banco: ${allQuestions.length} questões`);
    console.log(`  OAB 1ª FASE: ${oabQuestions.length} questões`);
    console.log(`  CONCURSOS: ${concursosQuestions.length} questões`);
    
    // Listar categorias
    const categories = [...new Set(allQuestions.map(q => q.category))];
    console.log('\n📚 CATEGORIAS NO BANCO:');
    categories.forEach(cat => {
      const count = allQuestions.filter(q => q.category === cat).length;
      console.log(`  ${cat}: ${count} questões`);
    });
    
    // Mostrar algumas questões de exemplo
    console.log('\n📝 EXEMPLOS DE QUESTÕES INSERIDAS:');
    const samples = allQuestions.slice(0, 3);
    samples.forEach((q, i) => {
      console.log(`\n${i+1}. ID: ${q.id} | ${q.category} (${q.challengeType})`);
      console.log(`   Texto: ${q.text.substring(0, 80)}...`);
      console.log(`   Opções: ${q.options.length} | Correta: ${String.fromCharCode(65 + q.correctAnswerIndex)}`);
    });
    
    console.log('\n🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Executar migração
migrateQuestionsToDatabase()
  .then(() => {
    console.log('✅ Script finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });