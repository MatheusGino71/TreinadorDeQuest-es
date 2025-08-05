import json

def create_diverse_sample():
    try:
        # Carregar todas as questões limpas
        with open('questions_cleaned.json', 'r', encoding='utf-8') as f:
            all_questions = json.load(f)
        
        print(f"📚 Total de questões disponíveis: {len(all_questions)}")
        
        # Separar por tipo
        oab_questions = [q for q in all_questions if q['challengeType'] == 'OAB_1_FASE']
        concursos_questions = [q for q in all_questions if q['challengeType'] == 'CONCURSOS_MPSP']
        
        print(f"  OAB 1ª FASE: {len(oab_questions)} questões")
        print(f"  CONCURSOS: {len(concursos_questions)} questões")
        
        # Criar amostra diversificada
        sample = []
        
        # Adicionar todas as questões de CONCURSOS (são poucas)
        sample.extend(concursos_questions)
        print(f"✅ Adicionadas {len(concursos_questions)} questões de CONCURSOS")
        
        # Para OAB, pegar amostra de cada categoria
        oab_by_category = {}
        for q in oab_questions:
            cat = q['category']
            if cat not in oab_by_category:
                oab_by_category[cat] = []
            oab_by_category[cat].append(q)
        
        # Adicionar amostras de cada categoria OAB
        target_per_category = min(50, max(10, 500 // len(oab_by_category)))  # máximo 500 questões OAB
        
        for category, questions in oab_by_category.items():
            category_sample = questions[:target_per_category]
            sample.extend(category_sample)
            print(f"✅ {category}: {len(category_sample)} questões")
        
        print(f"\n📊 AMOSTRA FINAL:")
        print(f"  Total: {len(sample)} questões")
        
        final_oab = [q for q in sample if q['challengeType'] == 'OAB_1_FASE']
        final_concursos = [q for q in sample if q['challengeType'] == 'CONCURSOS_MPSP']
        
        print(f"  OAB 1ª FASE: {len(final_oab)} questões")
        print(f"  CONCURSOS: {len(final_concursos)} questões")
        
        # Salvar amostra diversificada
        with open('questions_diverse_sample.json', 'w', encoding='utf-8') as f:
            json.dump(sample, f, indent=2, ensure_ascii=False)
        
        # Mostrar estatísticas por categoria
        categories = {}
        for q in sample:
            cat = q['category']
            categories[cat] = categories.get(cat, 0) + 1
        
        print(f"\n📚 POR CATEGORIA:")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"  {cat}: {count} questões")
        
        print(f"\n💾 Amostra salva em: questions_diverse_sample.json")
        return sample
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return []

if __name__ == "__main__":
    sample = create_diverse_sample()
    if sample:
        print(f"🎉 Amostra criada com sucesso: {len(sample)} questões!")