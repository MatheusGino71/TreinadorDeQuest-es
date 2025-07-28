import pandas as pd
import json
import sys

def process_excel_questions(file_path):
    try:
        # Ler o arquivo Excel
        df = pd.read_excel(file_path)
        
        print(f"📊 Arquivo carregado com {len(df)} linhas")
        print(f"📋 Colunas: {list(df.columns)}")
        
        # Mostrar algumas linhas de exemplo
        print("\n🔍 Primeiras 5 linhas:")
        for i in range(min(5, len(df))):
            row = df.iloc[i]
            print(f"Linha {i+1}:")
            for col in df.columns:
                print(f"  {col}: {str(row[col])[:100]}...")
        
        # Estrutura esperada:
        # ObjectQuestionId: ID da questão
        # Name: Nome/título da questão
        # QuestionStem: Texto da questão
        # Letter: A, B, C, D (opção)
        # Description: Texto da opção
        # Correct: True/False se é a resposta correta
        
        questions_dict = {}
        
        # Processar cada linha
        for index, row in df.iterrows():
            try:
                question_id = str(row['ObjectQuestionId']) if pd.notna(row['ObjectQuestionId']) else None
                question_stem = str(row['QuestionStem']) if pd.notna(row['QuestionStem']) else None
                letter = str(row['Letter']).strip().upper() if pd.notna(row['Letter']) else None
                description = str(row['Description']) if pd.notna(row['Description']) else None
                is_correct = row['Correct'] if pd.notna(row['Correct']) else False
                name = str(row['Name']) if pd.notna(row['Name']) else None
                
                if not question_id or not question_stem or not letter or not description:
                    continue
                
                # Inicializar questão se não existir
                if question_id not in questions_dict:
                    questions_dict[question_id] = {
                        'id': question_id,
                        'name': name,
                        'text': question_stem,
                        'options': ['', '', '', ''],
                        'correctAnswerIndex': 0,
                        'difficulty': 3,
                        'category': 'Direito Geral',
                        'challengeType': 'OAB_1_FASE',
                        'explanation': f"Questão {question_id}"
                    }
                
                # Mapear letra para índice
                letter_index = ord(letter) - ord('A') if letter in ['A', 'B', 'C', 'D'] else 0
                
                # Definir opção
                if 0 <= letter_index < 4:
                    questions_dict[question_id]['options'][letter_index] = description
                    
                    # Se é a resposta correta
                    if is_correct:
                        questions_dict[question_id]['correctAnswerIndex'] = letter_index
                
                # Tentar identificar categoria pela questão/nome
                if name and any(word in name.upper() for word in ['PENAL', 'CRIMINAL']):
                    questions_dict[question_id]['category'] = 'Direito Penal'
                elif name and any(word in name.upper() for word in ['CIVIL', 'CIVILISTICO']):
                    questions_dict[question_id]['category'] = 'Direito Civil'
                elif name and any(word in name.upper() for word in ['CONSTITUCIONAL', 'CONSTITUICAO']):
                    questions_dict[question_id]['category'] = 'Direito Constitucional'
                elif name and any(word in name.upper() for word in ['ADMINISTRATIVO', 'ADMIN']):
                    questions_dict[question_id]['category'] = 'Direito Administrativo'
                elif name and any(word in name.upper() for word in ['TRIBUTARIO', 'TRIBUTO']):
                    questions_dict[question_id]['category'] = 'Tributário'
                elif name and any(word in name.upper() for word in ['ETICA', 'PROFISSIONAL']):
                    questions_dict[question_id]['category'] = 'Ética Profissional'
                elif name and any(word in name.upper() for word in ['PROCESSO', 'PROCESSUAL']):
                    questions_dict[question_id]['category'] = 'Direito Processual'
                elif name and any(word in name.upper() for word in ['TRABALHO', 'TRABALHISTA']):
                    questions_dict[question_id]['category'] = 'Direito do Trabalho'
                elif name and any(word in name.upper() for word in ['EMPRESA', 'EMPRESARIAL']):
                    questions_dict[question_id]['category'] = 'Direito Empresarial'
                elif name and any(word in name.upper() for word in ['CONCURSO', 'MPSP', 'TRIBUNAL']):
                    questions_dict[question_id]['challengeType'] = 'CONCURSOS_MPSP'
                    questions_dict[question_id]['category'] = 'Direito Administrativo'
                
            except Exception as e:
                print(f"❌ Erro na linha {index + 1}: {e}")
                continue
        
        # Converter para lista
        questions = list(questions_dict.values())
        
        # Filtrar questões completas
        complete_questions = []
        for q in questions:
            # Verificar se tem todas as 4 opções preenchidas
            if all(opt.strip() for opt in q['options']):
                complete_questions.append(q)
        
        print(f"\n📊 PROCESSAMENTO CONCLUÍDO:")
        print(f"  Total de IDs únicos: {len(questions)}")
        print(f"  Questões completas (4 opções): {len(complete_questions)}")
        
        # Contar por tipo
        oab_count = len([q for q in complete_questions if q['challengeType'] == 'OAB_1_FASE'])
        concursos_count = len([q for q in complete_questions if q['challengeType'] == 'CONCURSOS_MPSP'])
        
        print(f"  OAB 1ª FASE: {oab_count} questões")
        print(f"  CONCURSOS: {concursos_count} questões")
        
        # Contar por categoria
        categories = {}
        for q in complete_questions:
            cat = q['category']
            categories[cat] = categories.get(cat, 0) + 1
        
        print(f"\n📚 POR CATEGORIA:")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"  {cat}: {count} questões")
        
        # Salvar primeiras 10 questões como exemplo
        if complete_questions:
            print(f"\n📝 EXEMPLO DAS PRIMEIRAS 5 QUESTÕES:")
            for i, q in enumerate(complete_questions[:5], 1):
                print(f"\n{i}. {q['category']} ({q['challengeType']})")
                print(f"   Texto: {q['text'][:100]}...")
                print(f"   Opções: {len([opt for opt in q['options'] if opt.strip()])}")
                print(f"   Correta: {chr(65 + q['correctAnswerIndex'])}")
        
        # Salvar arquivos
        with open('questions_from_new_excel.json', 'w', encoding='utf-8') as f:
            json.dump(complete_questions, f, indent=2, ensure_ascii=False)
        
        # Salvar em TypeScript
        ts_content = f"""// Questões extraídas do novo Excel - {len(complete_questions)} questões
export const questionsFromNewExcel = {json.dumps(complete_questions, indent=2, ensure_ascii=False)};
"""
        
        with open('questions_from_new_excel.ts', 'w', encoding='utf-8') as f:
            f.write(ts_content)
        
        print(f"\n💾 ARQUIVOS SALVOS:")
        print(f"  - questions_from_new_excel.json ({len(complete_questions)} questões)")
        print(f"  - questions_from_new_excel.ts")
        
        return complete_questions
        
    except Exception as e:
        print(f"❌ Erro fatal: {e}")
        return []

if __name__ == "__main__":
    file_path = "attached_assets/Questões MC 1ª FASE e Concursos_1753717156491.xlsx"
    questions = process_excel_questions(file_path)
    
    if questions:
        print(f"\n🎉 SUCESSO! {len(questions)} questões extraídas e prontas!")
    else:
        print(f"\n❌ Falha na extração.")