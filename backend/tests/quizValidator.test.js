import { validateQuizResponse } from '../src/utils/quizValidator.js';

describe('validateQuizResponse Helper', () => {
  it('should return empty results if response is null or not an object', () => {
    expect(validateQuizResponse(null)).toEqual({ validQuestions: [], invalidCount: 0 });
    expect(validateQuizResponse(undefined)).toEqual({ validQuestions: [], invalidCount: 0 });
    expect(validateQuizResponse("not an object")).toEqual({ validQuestions: [], invalidCount: 0 });
  });

  it('should return empty results if questions array is missing or not an array', () => {
    expect(validateQuizResponse({})).toEqual({ validQuestions: [], invalidCount: 0 });
    expect(validateQuizResponse({ questions: "not an array" })).toEqual({ validQuestions: [], invalidCount: 0 });
  });

  it('should identify a valid question', () => {
    const response = {
      questions: [
        {
          question: 'What is 2 + 2?',
          options: ['1', '2', '3', '4'],
          correctAnswer: '4'
        }
      ]
    };

    const result = validateQuizResponse(response);
    expect(result.validQuestions.length).toBe(1);
    expect(result.invalidCount).toBe(0);
    expect(result.validQuestions[0].question).toBe('What is 2 + 2?');
  });

  it('should filter out questions that do not contain exactly 4 options', () => {
    const response = {
      questions: [
        {
          question: 'Too few options',
          options: ['A', 'B', 'C'],
          correctAnswer: 'A'
        },
        {
          question: 'Too many options',
          options: ['A', 'B', 'C', 'D', 'E'],
          correctAnswer: 'A'
        },
        {
          question: 'Valid question',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A'
        }
      ]
    };

    const result = validateQuizResponse(response);
    expect(result.validQuestions.length).toBe(1);
    expect(result.invalidCount).toBe(2);
    expect(result.validQuestions[0].question).toBe('Valid question');
  });

  it('should filter out questions where correctAnswer is not in options', () => {
    const response = {
      questions: [
        {
          question: 'Mismatch option',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'E'
        }
      ]
    };

    const result = validateQuizResponse(response);
    expect(result.validQuestions.length).toBe(0);
    expect(result.invalidCount).toBe(1);
  });

  it('should filter out questions with missing fields or invalid types', () => {
    const response = {
      questions: [
        {
          question: 'Missing options',
          correctAnswer: 'A'
        },
        {
          question: 'Empty option',
          options: ['A', 'B', ' ', 'D'],
          correctAnswer: 'A'
        },
        {
          question: 1234,
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A'
        }
      ]
    };

    const result = validateQuizResponse(response);
    expect(result.validQuestions.length).toBe(0);
    expect(result.invalidCount).toBe(3);
  });
});
