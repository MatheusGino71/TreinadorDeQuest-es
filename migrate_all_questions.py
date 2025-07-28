import json
import re
import html
import sys
sys.path.append('.')

def clean_html_text(text):
    """Remove HTML tags and decode HTML entities"""
    if not text:
        return ""
    
    # Decode HTML entities
    text = html.unescape(text)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Clean up extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def load_and_clean_questions():
    """Load questions from JSON and clean HTML"""
    try:
        with open('questions_from_new_excel.json', 'r', encoding='utf-8') as f:
            raw_questions = json.load(f)
        
        print(f"📚 Carregadas {len(raw_questions)} questões do JSON")
        
        cleaned_questions = []
        
        for i, q in enumerate(raw_questions):
            try:
                # Clean text and options
                cleaned_question = {
                    'id': f"Q{str(i+1).zfill(4)}",
                    'text': clean_html_text(q['text']),
                    'options': [clean_html_text(opt) for opt in q['options']],
                    'correctAnswerIndex': q['correctAnswerIndex'],
                    'difficulty': q['difficulty'], 
                    'category': q['category'],
                    'challengeType': q['challengeType'],
                    'explanation': clean_html_text(q.get('explanation', f"Questão {i+1} extraída do Excel"))
                }
                
                # Validar se tem texto e 4 opções não vazias
                if (cleaned_question['text'].strip() and 
                    len(cleaned_question['options']) == 4 and
                    all(opt.strip() for opt in cleaned_question['options'])):
                    cleaned_questions.append(cleaned_question)
                else:
                    print(f"⚠️  Questão {i+1} ignorada: dados incompletos")
                    
            except Exception as e:
                print(f"❌ Erro na questão {i+1}: {e}")
                continue
        
        print(f"✅ {len(cleaned_questions)} questões limpas e válidas")
        
        # Salvar questões limpas
        with open('questions_cleaned.json', 'w', encoding='utf-8') as f:
            json.dump(cleaned_questions, f, indent=2, ensure_ascii=False)
        
        # Criar arquivo TypeScript
        ts_content = f"""// Questões limpas do Excel - {len(cleaned_questions)} questões válidas
export const questionsCleanedFromExcel = {json.dumps(cleaned_questions, indent=2, ensure_ascii=False)};
"""
        
        with open('questions_cleaned.ts', 'w', encoding='utf-8') as f:
            f.write(ts_content)
        
        return cleaned_questions
        
    except Exception as e:
        print(f"❌ Erro ao processar questões: {e}")
        return []

def save_sample_questions(questions, sample_size=50):
    """Save a sample of questions for testing"""
    if not questions:
        return
    
    # Get sample from different categories
    sample = []
    categories_seen = set()
    
    for q in questions:
        if len(sample) >= sample_size:
            break
        
        cat = q['category']
        if cat not in categories_seen or len(sample) < 20:
            sample.append(q)
            categories_seen.add(cat)
    
    # Ensure we have both types
    oab_sample = [q for q in sample if q['challengeType'] == 'OAB_1_FASE'][:40]
    concursos_sample = [q for q in sample if q['challengeType'] == 'CONCURSOS_MPSP'][:10]
    
    final_sample = oab_sample + concursos_sample
    
    with open('questions_sample.json', 'w', encoding='utf-8') as f:
        json.dump(final_sample, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Amostra salva: {len(final_sample)} questões em questions_sample.json")
    
    # Show sample stats
    oab_count = len([q for q in final_sample if q['challengeType'] == 'OAB_1_FASE'])
    conc_count = len([q for q in final_sample if q['challengeType'] == 'CONCURSOS_MPSP'])
    
    print(f"   OAB: {oab_count} questões")
    print(f"   CONCURSOS: {conc_count} questões")
    
    return final_sample

if __name__ == "__main__":
    print("🚀 Iniciando limpeza e preparação das questões...")
    
    # Load and clean questions
    questions = load_and_clean_questions()
    
    if questions:
        # Save sample for testing
        sample = save_sample_questions(questions, 100)
        
        # Print statistics
        oab_total = len([q for q in questions if q['challengeType'] == 'OAB_1_FASE'])
        conc_total = len([q for q in questions if q['challengeType'] == 'CONCURSOS_MPSP'])
        
        print(f"\n📊 ESTATÍSTICAS FINAIS:")
        print(f"  Total processado: {len(questions)} questões")
        print(f"  OAB 1ª FASE: {oab_total} questões")
        print(f"  CONCURSOS: {conc_total} questões")
        
        categories = {}
        for q in questions:
            cat = q['category']
            categories[cat] = categories.get(cat, 0) + 1
        
        print(f"\n📚 TOP 10 CATEGORIAS:")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {cat}: {count} questões")
        
        print(f"\n🎉 Processamento concluído! Questões prontas para migração.")
    else:
        print(f"❌ Falha no processamento das questões.")