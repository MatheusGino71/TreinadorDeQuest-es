#!/usr/bin/env python3
import pandas as pd
import json
import re

def extract_questions_from_excel(file_path):
    """Extract questions from Excel file and convert to TypeScript format"""
    try:
        # Read the Excel file
        df = pd.read_excel(file_path, engine='openpyxl')
        
        print("Colunas encontradas no arquivo:")
        print(df.columns.tolist())
        print("\nPrimeiras 5 linhas:")
        print(df.head())
        
        questions = []
        
        # Process each row
        for index, row in df.iterrows():
            try:
                # Extract basic question data
                question_data = {
                    'id': str(index + 1).zfill(3),  # Generate ID like 001, 002, etc.
                    'text': str(row.iloc[0]) if pd.notna(row.iloc[0]) else "",  # First column as question text
                    'options': [],
                    'correctAnswerIndex': 0,
                    'difficulty': 2,  # Default difficulty
                    'category': "Direito",  # Default category
                    'challengeType': "OAB_1_FASE",  # Default challenge type
                    'explanation': ""
                }
                
                # Extract options (assuming they are in columns 1-4)
                for i in range(1, min(5, len(row))):
                    if pd.notna(row.iloc[i]) and str(row.iloc[i]).strip():
                        question_data['options'].append(str(row.iloc[i]).strip())
                
                # Try to identify correct answer (look for markers like *, A), etc.)
                for i, option in enumerate(question_data['options']):
                    if option.startswith('*') or option.startswith('✓'):
                        question_data['correctAnswerIndex'] = i
                        question_data['options'][i] = re.sub(r'^[\*✓]\s*', '', option)
                        break
                
                # Try to extract course/category information
                if len(row) > 5 and pd.notna(row.iloc[5]):
                    course_info = str(row.iloc[5]).strip()
                    if 'constitucional' in course_info.lower():
                        question_data['category'] = "Direito Constitucional"
                    elif 'civil' in course_info.lower():
                        question_data['category'] = "Direito Civil"
                    elif 'penal' in course_info.lower():
                        question_data['category'] = "Direito Penal"
                    elif 'processo' in course_info.lower():
                        question_data['category'] = "Processo Civil"
                    elif 'trabalho' in course_info.lower():
                        question_data['category'] = "Direito do Trabalho"
                    elif 'empresarial' in course_info.lower():
                        question_data['category'] = "Direito Empresarial"
                    elif 'administrativo' in course_info.lower():
                        question_data['category'] = "Direito Administrativo"
                        question_data['challengeType'] = "CONCURSOS_MPSP"
                    
                    # Determine challenge type based on course
                    if any(x in course_info.lower() for x in ['mpsp', 'defensoria', 'tribunal', 'procuradoria', 'enam', 'cnu', 'concurso']):
                        if 'mpsp' in course_info.lower():
                            question_data['challengeType'] = "CONCURSOS_MPSP"
                        elif 'defensoria' in course_info.lower():
                            question_data['challengeType'] = "CONCURSOS_DEFENSORIA"
                        elif 'tribunal' in course_info.lower():
                            question_data['challengeType'] = "CONCURSOS_TRIBUNAIS"
                        elif 'procuradoria' in course_info.lower():
                            question_data['challengeType'] = "CONCURSOS_PROCURADORIAS"
                        elif 'enam' in course_info.lower():
                            question_data['challengeType'] = "CONCURSOS_ENAM"
                        elif 'cnu' in course_info.lower():
                            question_data['challengeType'] = "CONCURSOS_CNU"
                        else:
                            question_data['challengeType'] = "CONCURSOS_MPSP"
                
                # Only add questions with valid text and at least 2 options
                if question_data['text'] and len(question_data['options']) >= 2:
                    questions.append(question_data)
                    
            except Exception as e:
                print(f"Erro ao processar linha {index}: {e}")
                continue
        
        return questions
        
    except Exception as e:
        print(f"Erro ao ler arquivo Excel: {e}")
        return []

def generate_typescript_questions(questions):
    """Generate TypeScript code for questions"""
    ts_code = "export const questionsData = [\n"
    
    for i, q in enumerate(questions):
        ts_code += "  {\n"
        ts_code += f'    id: "{q["id"]}",\n'
        clean_text = q["text"].replace('"', '\\"')
        ts_code += f'    text: "{clean_text}",\n'
        ts_code += f'    options: {json.dumps(q["options"])},\n'
        ts_code += f'    correctAnswerIndex: {q["correctAnswerIndex"]},\n'
        ts_code += f'    difficulty: {q["difficulty"]},\n'
        ts_code += f'    category: "{q["category"]}",\n'
        ts_code += f'    challengeType: "{q["challengeType"]}",\n'
        ts_code += f'    explanation: "{q.get("explanation", "")}"\n'
        ts_code += "  }" + ("," if i < len(questions) - 1 else "") + "\n"
    
    ts_code += "];\n"
    return ts_code

if __name__ == "__main__":
    file_path = "attached_assets/Questões MC 1ª FASE e Concursos_1753714117406.xlsx"
    
    print("Extraindo questões do arquivo Excel...")
    questions = extract_questions_from_excel(file_path)
    
    print(f"Encontradas {len(questions)} questões válidas")
    
    if questions:
        # Generate TypeScript code
        ts_code = generate_typescript_questions(questions)
        
        # Save to file
        with open("extracted_questions.ts", "w", encoding="utf-8") as f:
            f.write(ts_code)
        
        print("Arquivo 'extracted_questions.ts' gerado com sucesso!")
        
        # Show sample questions
        print("\nExemplo de questões extraídas:")
        for i, q in enumerate(questions[:3]):
            print(f"\nQuestão {i+1}:")
            print(f"ID: {q['id']}")
            print(f"Texto: {q['text'][:100]}...")
            print(f"Categoria: {q['category']}")
            print(f"Tipo: {q['challengeType']}")
            print(f"Opções: {len(q['options'])}")
    else:
        print("Nenhuma questão válida foi extraída do arquivo.")