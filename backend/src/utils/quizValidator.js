export function validateQuizResponse(response) {
  if (!response || typeof response !== 'object') {
    return {
      validQuestions: [],
      invalidCount: 0
    };
  }

  if (!Array.isArray(response.questions)) {
    return {
      validQuestions: [],
      invalidCount: 0
    };
  }

  const validQuestions = [];
  let invalidCount = 0;

  for (const q of response.questions) {
    if (!q || typeof q !== 'object') {
      invalidCount++;
      continue;
    }

    const { question, options, correctAnswer } = q;

    // Check required fields
    if (
      typeof question !== 'string' || !question.trim() ||
      !Array.isArray(options) ||
      typeof correctAnswer !== 'string' || !correctAnswer.trim()
    ) {
      invalidCount++;
      continue;
    }

    // Check options rule (exactly 4 options)
    if (options.length !== 4) {
      invalidCount++;
      continue;
    }

    // Check all options are valid non-empty strings
    const hasInvalidOption = options.some((opt) => typeof opt !== 'string' || !opt.trim());
    if (hasInvalidOption) {
      invalidCount++;
      continue;
    }

    // Check correctAnswer exists in options
    if (!options.includes(correctAnswer)) {
      invalidCount++;
      continue;
    }

    // Valid question
    validQuestions.push(q);
  }

  return {
    validQuestions,
    invalidCount
  };
}
