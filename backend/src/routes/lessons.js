const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all lessons (with completion status for the logged-in user)
router.get('/', authMiddleware, async (req, res) => {
  const { category_id } = req.query;
  const userId = req.user.id;

  try {
    let query = db('lessons')
      .leftJoin('user_progress', function() {
        this.on('user_progress.lesson_id', '=', 'lessons.id')
            .andOn('user_progress.user_id', '=', db.raw('?', [userId]));
      })
      .select(
        'lessons.id',
        'lessons.category_id',
        'lessons.title',
        'lessons.summary',
        'lessons.difficulty',
        'lessons.xp_reward',
        db.raw('CASE WHEN user_progress.completed = 1 THEN 1 ELSE 0 END as completed'),
        'user_progress.quiz_score'
      );

    if (category_id) {
      query = query.where('lessons.category_id', category_id);
    }

    const lessons = await query;
    res.json({ lessons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching lessons.' });
  }
});

// Get single lesson details with its slides and quiz
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const lesson = await db('lessons').where('id', id).first();
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    if (typeof lesson.content === 'string') {
      try {
        lesson.content = JSON.parse(lesson.content);
      } catch (e) {
        lesson.content = [];
      }
    }

    const quiz = await db('quizzes').where('lesson_id', id).first();
    if (quiz && typeof quiz.options === 'string') {
      try {
        quiz.options = JSON.parse(quiz.options);
      } catch (e) {
        quiz.options = [];
      }
    }

    const progress = await db('user_progress')
      .where('user_id', userId)
      .andWhere('lesson_id', id)
      .first();

    res.json({
      lesson,
      quiz: quiz ? {
        id: quiz.id,
        question: quiz.question,
        options: quiz.options,
        explanation: quiz.explanation
      } : null,
      completed: progress ? !!progress.completed : false,
      quiz_score: progress ? progress.quiz_score : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching lesson details.' });
  }
});

// Submit Quiz / complete lesson
router.post('/:id/quiz', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { selected_option_idx } = req.body;
  const userId = req.user.id;

  if (selected_option_idx === undefined) {
    return res.status(400).json({ error: 'Please select an option.' });
  }

  try {
    const lesson = await db('lessons').where('id', id).first();
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    const quiz = await db('quizzes').where('lesson_id', id).first();
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz for this lesson not found.' });
    }

    const isCorrect = selected_option_idx === quiz.correct_option_idx;
    const score = isCorrect ? 100 : 0;

    const existingProgress = await db('user_progress')
      .where('user_id', userId)
      .andWhere('lesson_id', id)
      .first();

    let xpGained = 0;
    let isFirstCompletion = false;

    if (!existingProgress) {
      isFirstCompletion = true;
      await db('user_progress').insert({
        user_id: userId,
        lesson_id: id,
        completed: true,
        quiz_score: score,
        completed_at: new Date()
      });

      xpGained = isCorrect ? lesson.xp_reward : Math.round(lesson.xp_reward / 2);

      const user = await db('users').where('id', userId).first();
      const newXp = (user.xp || 0) + xpGained;

      let updatedStreak = user.streak;
      const now = new Date();
      const lastActive = user.last_active_at ? new Date(user.last_active_at) : null;

      if (lastActive) {
        const diffTime = Math.abs(now - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          updatedStreak += 1;
        } else if (diffDays > 1) {
          updatedStreak = 1;
        }
      } else {
        updatedStreak = 1;
      }

      await db('users')
        .where('id', userId)
        .update({
          xp: newXp,
          streak: updatedStreak,
          last_active_at: now
        });
    }

    res.json({
      isCorrect,
      correctOptionIdx: quiz.correct_option_idx,
      explanation: quiz.explanation,
      xpGained,
      isFirstCompletion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error processing quiz.' });
  }
});

module.exports = router;
