#!/usr/bin/env python3
import pandas as pd
import re
import html

def clean_html_text(text):
    """Clean HTML tags and decode HTML entities"""
    # Decode HTML entities
    text = html.unescape(text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Clean up extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_clean_questions(file_path, max_questions=50):
    """Extract and clean questions from Excel file"""
    try:
        df = pd.read_excel(file_path, engine='openpyxl')
        
        # Group by ObjectQuestionId
        questions_dict = {}
        
        for index, row in df.iterrows():
            question_id = str(row['ObjectQuestionId'])
            
            if question_id not in questions_dict:
                # Clean the question stem
                question_stem = str(row['QuestionStem']) if pd.notna(row['QuestionStem']) else ""
                question_stem = clean_html_text(question_stem)
                
                # Get course name
                course_name = str(row['Name']) if pd.notna(row['Name']) else "Direito"
                
                questions_dict[question_id] = {
                    'id': question_id,
                    'text': question_stem,
                    'course': course_name,
                    'options': [],
                    'correctAnswerIndex': 0,
                    'difficulty': 2,
                    'category': course_name,
                    'challengeType': "OAB_1_FASE",
                    'explanation': ""
                }
            
            # Add option
            if pd.notna(row['Description']):
                option_text = clean_html_text(str(row['Description']))
                if option_text and len(option_text) > 5:  # Filter out very short options
                    questions_dict[question_id]['options'].append(option_text)
                    
                    # If this is the correct answer
                    if int(row['Correct']) == 1:
                        questions_dict[question_id]['correctAnswerIndex'] = len(questions_dict[question_id]['options']) - 1
        
        # Filter and categorize questions
        valid_questions = []
        for q_id, question in questions_dict.items():
            if question['text'] and len(question['options']) == 4:  # Only complete questions
                # Categorize based on course name
                course_lower = question['course'].lower()
                
                if 'constitucional' in course_lower:
                    question['category'] = "Direito Constitucional"
                    question['challengeType'] = "OAB_1_FASE"
                elif 'civil' in course_lower:
                    question['category'] = "Direito Civil"
                    question['challengeType'] = "OAB_1_FASE"
                elif 'penal' in course_lower:
                    question['category'] = "Direito Penal"
                    question['challengeType'] = "OAB_1_FASE"
                elif 'processo' in course_lower:
                    question['category'] = "Processo Civil"
                    question['challengeType'] = "OAB_1_FASE"
                elif 'trabalho' in course_lower:
                    question['category'] = "Direito do Trabalho"
                    question['challengeType'] = "OAB_1_FASE"
                elif 'empresarial' in course_lower:
                    question['category'] = "Direito Empresarial"
                    question['challengeType'] = "OAB_1_FASE"
                elif 'administrativo' in course_lower:
                    question['category'] = "Direito Administrativo"
                    question['challengeType'] = "CONCURSOS_MPSP"
                else:
                    # Try to categorize by question content
                    text_lower = question['text'].lower()
                    if any(word in text_lower for word in ['tribunal do júri', 'homicídio', 'crime']):
                        question['category'] = "Direito Penal"
                        question['challengeType'] = "OAB_1_FASE"
                    elif any(word in text_lower for word in ['ministério público', 'promotor']):
                        question['challengeType'] = "CONCURSOS_MPSP"
                    elif any(word in text_lower for word in ['defensoria', 'defensor']):
                        question['challengeType'] = "CONCURSOS_DEFENSORIA"
                    elif any(word in text_lower for word in ['tribunal', 'magistratura']):
                        question['challengeType'] = "CONCURSOS_TRIBUNAIS"
                
                valid_questions.append(question)
                
                if len(valid_questions) >= max_questions:
                    break
        
        return valid_questions
        
    except Exception as e:
        print(f"Erro: {e}")
        return []

def generate_typescript_file(questions):
    """Generate clean TypeScript file"""
    ts_content = '''import { Question } from "@shared/schema";

export const questionsFromExcel: Omit<Question, 'id' | 'createdAt'>[] = [
'''
    
    for i, q in enumerate(questions):
        # Escape quotes and newlines
        text = q['text'].replace('"', '\\"').replace('\n', ' ').replace('\r', ' ')
        options_str = '", "'.join([opt.replace('"', '\\"') for opt in q['options']])
        
        ts_content += f'''  {{
    text: "{text}",
    options: ["{options_str}"],
    correctAnswerIndex: {q['correctAnswerIndex']},
    difficulty: {q['difficulty']},
    category: "{q['category']}",
    challengeType: "{q['challengeType']}",
    explanation: "Questão extraída do curso: {q['course']}"
  }}{"," if i < len(questions) - 1 else ""}
'''
    
    ts_content += '''
];
'''
    
    return ts_content

if __name__ == "__main__":
    file_path = "attached_assets/Questões MC 1ª FASE e Concursos_1753714117406.xlsx"
    
    print("Extraindo e limpando questões...")
    questions = extract_clean_questions(file_path, 50)
    
    print(f"Extraídas {len(questions)} questões válidas")
    
    if questions:
        ts_content = generate_typescript_file(questions)
        
        with open("clean_questions.ts", "w", encoding="utf-8") as f:
            f.write(ts_content)
        
        print("Arquivo 'clean_questions.ts' gerado!")
        
        # Show categories
        categories = {}
        challenge_types = {}
        
        for q in questions:
            categories[q['category']] = categories.get(q['category'], 0) + 1
            challenge_types[q['challengeType']] = challenge_types.get(q['challengeType'], 0) + 1
        
        print("\nCategorias encontradas:")
        for cat, count in categories.items():
            print(f"- {cat}: {count} questões")
        
        print("\nTipos de desafio:")
        for ctype, count in challenge_types.items():
            print(f"- {ctype}: {count} questões")
    else:
        print("Nenhuma questão válida encontrada.")