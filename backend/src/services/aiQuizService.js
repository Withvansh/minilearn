import db from '../db/knex.js';
import crypto from 'crypto';
import { validateQuizResponse } from '../utils/quizValidator.js';

export class AiQuizService {
  static async generateQuizFromLessons(courseId, { count = 5, lessonIds = [] }) {
    // 1. Fetch lessons from database
    let query = db('lessons')
      .join('sections', 'lessons.section_id', 'sections.id')
      .where('sections.course_id', courseId)
      .select('lessons.id', 'lessons.title', 'lessons.content');

    if (Array.isArray(lessonIds) && lessonIds.length > 0) {
      query = query.whereIn('lessons.id', lessonIds);
    }

    const lessons = await query;
    if (lessons.length === 0) {
      const error = new Error('No lessons found for this course or selected lesson IDs');
      error.status = 400;
      throw error;
    }

    const lessonMap = new Map(lessons.map((l) => [l.id, l]));

    // 2. Prepare AI prompts
    const lessonsText = lessons
      .map((l) => `Lesson ID: ${l.id}\nTitle: ${l.title}\nContent: ${l.content || '(Empty)'}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are a professional quiz generator for the MiniLearn platform.
Your task is to generate exactly ${count} multiple-choice questions based on the provided lessons text.

You MUST return a STRICT JSON object matching this exact schema:
{
  "questions": [
    {
      "lessonId": "string (MUST exactly match one of the provided Lesson IDs)",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (MUST exactly match one of the 4 options)"
    }
  ]
}

Rules:
1. Each question object MUST contain a valid "lessonId" matching the lesson it tests.
2. The "options" array MUST contain exactly 4 options.
3. The "correctAnswer" MUST be string-identical to one of the 4 options.
4. Distractors must be plausible, and difficulty should be mixed.
5. Return ONLY the raw JSON object. Do not include markdown blocks or extra text.`;

    const userPrompt = `Here are the lessons:\n\n${lessonsText}`;

    // 3. Invoke Gemini with retry and timeout logic
    let rawResult = '';
    let parsedData = null;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        rawResult = await this.callGemini(systemPrompt, userPrompt, 30000); // 30s timeout
        parsedData = JSON.parse(rawResult);

        if (parsedData && Array.isArray(parsedData.questions)) {
          break;
        }
        
        console.warn(`Attempt ${attempts} parsed JSON successfully but did not contain a questions array.`);
      } catch (err) {
        console.error(`AI generation attempt ${attempts} failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          const error = new Error('Failed to generate valid quiz questions from AI provider after retries');
          error.status = 502;
          throw error;
        }
      }
    }

    // 4. Validate and filter questions using helper
    const { validQuestions: parsedQuestions } = validateQuizResponse(parsedData);
    const validQuestions = [];
    
    for (const q of parsedQuestions) {
      if (!q.lessonId || !lessonMap.has(q.lessonId)) continue;

      const correctOptionIdx = q.options.indexOf(q.correctAnswer);
      validQuestions.push({
        id: crypto.randomUUID(),
        lesson_id: q.lessonId,
        question_text: q.question,
        options: JSON.stringify(q.options),
        correct_option_idx: correctOptionIdx
      });
    }

    // 5. Check if we have at least one valid question
    if (validQuestions.length === 0) {
      const error = new Error('Failed to generate valid quiz questions from AI provider after retries');
      error.status = 502;
      throw error;
    }

    // 6. Save valid questions to database
    await db('quiz_questions').insert(validQuestions);

    return validQuestions.map((vq) => ({
      id: vq.id,
      lesson_id: vq.lesson_id,
      question_text: vq.question_text,
      options: JSON.parse(vq.options),
      correct_option_idx: vq.correct_option_idx
    }));
  }

  static async callGemini(systemPrompt, userPrompt, timeoutMs = 30000) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'mock-api-key-for-local-testing' || process.env.NODE_ENV === 'test') {
      console.warn('GEMINI_API_KEY is not configured or running in test mode. Returning mock quiz questions.');
      return this.getMockAIResponse(userPrompt);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Gemini OpenAI-compatible API HTTP Error ${response.status}: ${body}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  static getMockAIResponse(userPrompt) {
    const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
    const lessonIds = userPrompt.match(uuidRegex) || [crypto.randomUUID()];

    const mockResponse = {
      questions: lessonIds.slice(0, 5).map((lessonId, idx) => ({
        lessonId,
        question: `Sample AI generated question ${idx + 1} relating to the lesson contents?`,
        options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
        correctAnswer: 'Option B text'
      }))
    };

    return JSON.stringify(mockResponse);
  }
}
