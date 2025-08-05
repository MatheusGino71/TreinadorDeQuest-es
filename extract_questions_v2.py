#!/usr/bin/env python3
import pandas as pd
import json

def extract_questions_from_excel_v2(file_path):
    """Extract questions from Excel file with proper structure analysis"""
    try:
        # Read the Excel file
        df = pd.read_excel(file_path, engine='openpyxl')
        
        print("Estrutura do arquivo:")
        print("Colunas:", df.columns.tolist())
        print("Total de linhas:", len(df))
        print("\nPrimeiras 10 linhas:")
        print(df.head(10))
        
        # Analyze the structure - seems like each row is an option for a question
        # Group by ObjectQuestionId to get complete questions
        questions_dict = {}
        
        for index, row in df.iterrows():
            question_id = str(row['ObjectQuestionId'])
            
            if question_id not in questions_dict:
                questions_dict[question_id] = {
                    'id': question_id,
                    'text': str(row['QuestionStem']) if pd.notna(row['QuestionStem']) else "",
                    'options': [],
                    'correctAnswerIndex': 0,
                    'difficulty': 2,
                    'category': "Direito",
                    'challengeType': "OAB_1_FASE",
                    'explanation': ""
                }
            
            # Add option
            if pd.notna(row['Description']):
                option_text = str(row['Description']).strip()
                if option_text:
                    questions_dict[question_id]['options'].append(option_text)
                    
                    # If this is the correct answer
                    if int(row['Correct']) == 1:
                        questions_dict[question_id]['correctAnswerIndex'] = len(questions_dict[question_id]['options']) - 1
        
        # Convert to list and filter valid questions
        valid_questions = []
        for q_id, question in questions_dict.items():
            if question['text'] and len(question['options']) >= 2:
                # Try to categorize based on question content
                text_lower = question['text'].lower()
                
                if any(word in text_lower for word in ['constituição', 'constitucional', 'supremo tribunal']):
                    question['category'] = "Direito Constitucional"
                elif any(word in text_lower for word in ['civil', 'contrato', 'propriedade', 'família']):
                    question['category'] = "Direito Civil"
                elif any(word in text_lower for word in ['penal', 'crime', 'delito', 'homicídio']):
                    question['category'] = "Direito Penal"
                elif any(word in text_lower for word in ['processo', 'citação', 'contestação', 'recurso']):
                    question['category'] = "Processo Civil"
                elif any(word in text_lower for word in ['trabalho', 'trabalhista', 'empregado', 'salário']):
                    question['category'] = "Direito do Trabalho"
                elif any(word in text_lower for word in ['empresarial', 'sociedade', 'empresa', 'comercial']):
                    question['category'] = "Direito Empresarial"
                elif any(word in text_lower for word in ['administrativo', 'servidor', 'administração pública']):
                    question['category'] = "Direito Administrativo"
                    question['challengeType'] = "CONCURSOS_MPSP"
                
                # Determine challenge type for concursos
                if any(word in text_lower for word in ['ministério público', 'mp', 'promotor']):
                    question['challengeType'] = "CONCURSOS_MPSP"
                elif any(word in text_lower for word in ['defensoria', 'defensor público']):
                    question['challengeType'] = "CONCURSOS_DEFENSORIA"
                elif any(word in text_lower for word in ['tribunal', 'magistratura']):
                    question['challengeType'] = "CONCURSOS_TRIBUNAIS"
                elif any(word in text_lower for word in ['procuradoria', 'procurador']):
                    question['challengeType'] = "CONCURSOS_PROCURADORIAS"
                
                valid_questions.append(question)
        
        return valid_questions[:100]  # Limit to first 100 questions for performance
        
    except Exception as e:
        print(f"Erro ao ler arquivo Excel: {e}")
        return []

def generate_typescript_questions_v2(questions):
    """Generate TypeScript code for questions"""
    ts_code = "export const questionsData = [\n"
    
    for i, q in enumerate(questions):
        ts_code += "  {\n"
        ts_code += f'    id: "{q["id"]}",\n'
        
        # Clean text for TypeScript
        clean_text = q["text"].replace('"', '\\"').replace('\n', '\\n').replace('\r', '')
        if len(clean_text) > 300:
            clean_text = clean_text[:300] + "..."
        
        ts_code += f'    text: "{clean_text}",\n'
        ts_code += f'    options: {json.dumps(q["options"])},\n'
        ts_code += f'    correctAnswerIndex: {q["correctAnswerIndex"]},\n'
        ts_code += f'    difficulty: {q["difficulty"]},\n'
        ts_code += f'    category: "{q["category"]}",\n'
        ts_code += f'    challengeType: "{q["challengeType"]}",\n'
        ts_code += f'    explanation: ""\n'
        ts_code += "  }" + ("," if i < len(questions) - 1 else "") + "\n"
    
    ts_code += "];\n"
    return ts_code

if __name__ == "__main__":
    file_path = "attached_assets/Questões MC 1ª FASE e Concursos_1753714117406.xlsx"
    
    print("Extraindo questões do arquivo Excel (versão 2)...")
    questions = extract_questions_from_excel_v2(file_path)
    
    print(f"Encontradas {len(questions)} questões válidas")
    
    if questions:
        # Generate TypeScript code
        ts_code = generate_typescript_questions_v2(questions)
        
        # Save to file
        with open("questions_from_excel.ts", "w", encoding="utf-8") as f:
            f.write(ts_code)
        
        print("Arquivo 'questions_from_excel.ts' gerado com sucesso!")
        
        # Show sample questions
        print("\nExemplo de questões extraídas:")
        for i, q in enumerate(questions[:5]):
            print(f"\nQuestão {i+1}:")
            print(f"ID: {q['id']}")
            print(f"Texto: {q['text'][:100]}...")
            print(f"Categoria: {q['category']}")
            print(f"Tipo: {q['challengeType']}")
            print(f"Opções: {len(q['options'])}")
            print(f"Resposta correta: {q['correctAnswerIndex']}")
    else:
        print("Nenhuma questão válida foi extraída do arquivo.")