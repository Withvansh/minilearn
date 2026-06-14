export function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('username').unique().notNullable();
      table.string('email').unique().notNullable();
      table.string('password_hash').notNullable();
      table.timestamps(true, true);
    })
    .createTable('courses', (table) => {
      table.uuid('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.timestamps(true, true);
    })
    .createTable('sections', (table) => {
      table.uuid('id').primary();
      table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
      table.string('title').notNullable();
      table.integer('order').notNullable().defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('lessons', (table) => {
      table.uuid('id').primary();
      table.uuid('section_id').notNullable().references('id').inTable('sections').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('content');
      table.integer('order').notNullable().defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('enrollments', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['user_id', 'course_id']);
    })
    .createTable('lesson_progress', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('lesson_id').notNullable().references('id').inTable('lessons').onDelete('CASCADE');
      table.boolean('completed').notNullable().defaultTo(false);
      table.timestamp('completed_at');
      table.timestamps(true, true);
      table.unique(['user_id', 'lesson_id']);
    })
    .createTable('quiz_questions', (table) => {
      table.uuid('id').primary();
      table.uuid('lesson_id').notNullable().references('id').inTable('lessons').onDelete('CASCADE');
      table.text('question_text').notNullable();
      table.text('options').notNullable(); // JSON Array of options
      table.integer('correct_option_idx').notNullable();
      table.timestamps(true, true);
    })
    .createTable('quiz_attempts', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('quiz_question_id').notNullable().references('id').inTable('quiz_questions').onDelete('CASCADE');
      table.integer('selected_option_idx').notNullable();
      table.boolean('is_correct').notNullable();
      table.timestamps(true, true);
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists('quiz_attempts')
    .dropTableIfExists('quiz_questions')
    .dropTableIfExists('lesson_progress')
    .dropTableIfExists('enrollments')
    .dropTableIfExists('lessons')
    .dropTableIfExists('sections')
    .dropTableIfExists('courses')
    .dropTableIfExists('users');
}
