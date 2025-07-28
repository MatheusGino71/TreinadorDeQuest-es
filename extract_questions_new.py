import pandas as pd
import json
import sys

def extract_questions_from_excel(file_path):
    try:
        # Ler o arquivo Excel
        df = pd.read_excel(file_path)
        
        print(f"📊 Arquivo carregado com {len(df)} linhas")
        print(f"📋 Colunas encontradas: {list(df.columns)}")
        
        questions = []
        
        # Processar cada linha do Excel
        for index, row in df.iterrows():
            try:
                # Extrair dados da questão (adaptando aos nomes das colunas)
                question_data = {}
                
                # Mapear colunas possíveis
                text_cols = ['QUESTÃO', 'QUESTAO', 'TEXTO', 'PERGUNTA', 'ENUNCIADO']
                option_cols = ['A)', 'B)', 'C)', 'D)', 'OPCAO_A', 'OPCAO_B', 'OPCAO_C', 'OPCAO_D']
                answer_cols = ['GABARITO', 'RESPOSTA', 'CORRETA', 'ANSWER']
                category_cols = ['DISCIPLINA', 'MATERIA', 'CATEGORIA', 'AREA']
                type_cols = ['TIPO', 'CHALLENGE_TYPE', 'MODALIDADE']
                
                # Encontrar coluna do texto da questão
                text = None
                for col in text_cols:
                    if col in df.columns:
                        text = str(row[col]) if pd.notna(row[col]) else None
                        break
                
                if not text or text == 'nan':
                    print(f"⚠️  Linha {index + 1}: Texto da questão não encontrado")
                    continue
                
                # Extrair opções
                options = []
                for i, col_pattern in enumerate(['A)', 'B)', 'C)', 'D)']):
                    option_found = False
                    for col in df.columns:
                        if col_pattern in col or f'OPCAO_{chr(65+i)}' in col:
                            option_value = str(row[col]) if pd.notna(row[col]) else f"Opção {chr(65+i)}"
                            options.append(option_value)
                            option_found = True
                            break
                    if not option_found:
                        options.append(f"Opção {chr(65+i)}")
                
                # Encontrar gabarito
                correct_answer = None
                for col in answer_cols:
                    if col in df.columns:
                        answer_val = str(row[col]).strip().upper() if pd.notna(row[col]) else None
                        if answer_val in ['A', 'B', 'C', 'D']:
                            correct_answer = ord(answer_val) - ord('A')  # 0-3
                            break
                
                if correct_answer is None:
                    correct_answer = 0  # Default para A
                    print(f"⚠️  Linha {index + 1}: Gabarito não encontrado, usando A como padrão")
                
                # Encontrar categoria
                category = "Direito Geral"
                for col in category_cols:
                    if col in df.columns and pd.notna(row[col]):
                        category = str(row[col])
                        break
                
                # Encontrar tipo de desafio
                challenge_type = "OAB_1_FASE"
                for col in type_cols:
                    if col in df.columns and pd.notna(row[col]):
                        type_val = str(row[col]).upper()
                        if 'CONCURSO' in type_val or 'MPSP' in type_val:
                            challenge_type = "CONCURSOS_MPSP"
                        break
                
                # Extrair explicação se existir
                explanation = None
                explanation_cols = ['EXPLICACAO', 'JUSTIFICATIVA', 'COMENTARIO', 'FUNDAMENTACAO']
                for col in explanation_cols:
                    if col in df.columns and pd.notna(row[col]):
                        explanation = str(row[col])
                        break
                
                question = {
                    'text': text,
                    'options': options,
                    'correctAnswerIndex': correct_answer,
                    'difficulty': 3,  # Dificuldade média
                    'category': category,
                    'challengeType': challenge_type,
                    'explanation': explanation or f"Questão {index + 1} extraída do Excel"
                }
                
                questions.append(question)
                print(f"✅ Questão {index + 1}: {category} - {challenge_type}")
                
            except Exception as e:
                print(f"❌ Erro na linha {index + 1}: {e}")
                continue
        
        print(f"\n📊 EXTRAÇÃO CONCLUÍDA:")
        print(f"  Total extraído: {len(questions)} questões")
        
        # Contar por tipo
        oab_count = len([q for q in questions if q['challengeType'] == 'OAB_1_FASE'])
        concursos_count = len([q for q in questions if q['challengeType'] == 'CONCURSOS_MPSP'])
        
        print(f"  OAB 1ª FASE: {oab_count} questões")
        print(f"  CONCURSOS: {concursos_count} questões")
        
        # Salvar em arquivo JSON
        with open('questions_extracted_new.json', 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        # Salvar em arquivo TypeScript
        ts_content = f"""// Questões extraídas do Excel - {len(questions)} questões
export const questionsFromNewExcel = {json.dumps(questions, indent=2, ensure_ascii=False)};
"""
        
        with open('questions_new_excel.ts', 'w', encoding='utf-8') as f:
            f.write(ts_content)
        
        print(f"💾 Arquivos salvos:")
        print(f"  - questions_extracted_new.json ({len(questions)} questões)")
        print(f"  - questions_new_excel.ts (TypeScript)")
        
        return questions
        
    except Exception as e:
        print(f"❌ Erro ao processar Excel: {e}")
        return []

if __name__ == "__main__":
    file_path = "attached_assets/Questões MC 1ª FASE e Concursos_1753717156491.xlsx"
    questions = extract_questions_from_excel(file_path)
    
    if questions:
        print(f"\n🎉 Sucesso! {len(questions)} questões extraídas e prontas para migração.")
    else:
        print(f"\n❌ Falha na extração das questões.")