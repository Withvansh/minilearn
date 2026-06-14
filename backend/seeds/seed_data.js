import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function seed(knex) {
  // Clear existing tables in dependency order
  await knex('quiz_attempts').del();
  await knex('quiz_questions').del();
  await knex('lesson_progress').del();
  await knex('enrollments').del();
  await knex('lessons').del();
  await knex('sections').del();
  await knex('courses').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Generate UUIDs for users
  const instructorIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
  const learnerIds = [
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID()
  ];

  // 1. Insert 3 Instructors and 5 Learners
  await knex('users').insert([
    // Instructors
    { id: instructorIds[0], username: 'dr_sarah', email: 'sarah@minilearn.com', password_hash: passwordHash },
    { id: instructorIds[1], username: 'prof_amit', email: 'amit@minilearn.com', password_hash: passwordHash },
    { id: instructorIds[2], username: 'mentor_james', email: 'james@minilearn.com', password_hash: passwordHash },
    // Learners
    { id: learnerIds[0], username: 'alex', email: 'alex@learner.com', password_hash: passwordHash },
    { id: learnerIds[1], username: 'bob', email: 'bob@learner.com', password_hash: passwordHash },
    { id: learnerIds[2], username: 'chloe', email: 'chloe@learner.com', password_hash: passwordHash },
    { id: learnerIds[3], username: 'daniel', email: 'daniel@learner.com', password_hash: passwordHash },
    { id: learnerIds[4], username: 'emma', email: 'emma@learner.com', password_hash: passwordHash }
  ]);

  // Generate UUIDs for courses
  const courseIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];

  // 2. Insert 3 Courses
  await knex('courses').insert([
    {
      id: courseIds[0],
      title: 'Introduction to JavaScript',
      description: 'Master core JavaScript concepts, syntax, control flow, scopes, closures, and object-oriented foundations.'
    },
    {
      id: courseIds[1],
      title: 'Relational Database Design & SQL',
      description: 'Learn database theory, schemas, normalization tables, and write advanced database queries using SQL.'
    },
    {
      id: courseIds[2],
      title: 'Mastering Personal Finance',
      description: 'Understand the building blocks of financial independence: cash flow, budgets, saving strategies, and investing fundamentals.'
    }
  ]);

  // Course 1: JavaScript
  const c1s1Id = crypto.randomUUID();
  const c1s2Id = crypto.randomUUID();
  const c1s1l1Id = crypto.randomUUID();
  const c1s1l2Id = crypto.randomUUID();
  const c1s1l3Id = crypto.randomUUID();
  const c1s2l1Id = crypto.randomUUID();
  const c1s2l2Id = crypto.randomUUID();
  const c1s2l3Id = crypto.randomUUID();

  // Course 2: Databases
  const c2s1Id = crypto.randomUUID();
  const c2s2Id = crypto.randomUUID();
  const c2s1l1Id = crypto.randomUUID();
  const c2s1l2Id = crypto.randomUUID();
  const c2s1l3Id = crypto.randomUUID();
  const c2s2l1Id = crypto.randomUUID();
  const c2s2l2Id = crypto.randomUUID();
  const c2s2l3Id = crypto.randomUUID();

  // Course 3: Finance
  const c3s1Id = crypto.randomUUID();
  const c3s2Id = crypto.randomUUID();
  const c3s1l1Id = crypto.randomUUID();
  const c3s1l2Id = crypto.randomUUID();
  const c3s1l3Id = crypto.randomUUID();
  const c3s2l1Id = crypto.randomUUID();
  const c3s2l2Id = crypto.randomUUID();
  const c3s2l3Id = crypto.randomUUID();

  // 3. Insert Sections
  await knex('sections').insert([
    // Course 1 Sections
    { id: c1s1Id, course_id: courseIds[0], title: 'JS Basics & Control Flow', order: 1 },
    { id: c1s2Id, course_id: courseIds[0], title: 'Functions, Scope & Objects', order: 2 },
    // Course 2 Sections
    { id: c2s1Id, course_id: courseIds[1], title: 'Database Fundamentals', order: 1 },
    { id: c2s2Id, course_id: courseIds[1], title: 'SQL Queries & Table Joins', order: 2 },
    // Course 3 Sections
    { id: c3s1Id, course_id: courseIds[2], title: 'Budgeting & Saving Strategies', order: 1 },
    { id: c3s2Id, course_id: courseIds[2], title: 'Investing & Wealth Accumulation', order: 2 }
  ]);

  // 4. Insert Lessons (3 per section)
  await knex('lessons').insert([
    // Course 1 Section 1 Lessons
    {
      id: c1s1l1Id,
      section_id: c1s1Id,
      title: 'Variables & Data Types',
      order: 1,
      content: 'JavaScript has dynamic types. Variables can be declared using var, let, or const. Primitives include numbers, strings, booleans, null, undefined, and symbols. Objects are collections of key-value pairs.'
    },
    {
      id: c1s1l2Id,
      section_id: c1s1Id,
      title: 'Conditionals & Logical Operators',
      order: 2,
      content: 'Conditionals control flow using if, else if, else, and switch statements. Logical operators (&&, ||, !) evaluate boolean conditions. Strict equality (===) compares both value and type.'
    },
    {
      id: c1s1l3Id,
      section_id: c1s1Id,
      title: 'Loops & Iteration structures',
      order: 3,
      content: 'Loops repeat code blocks. JS supports for, while, and do-while loops. You can use the break keyword to exit a loop prematurely, and continue to skip the current iteration.'
    },
    // Course 1 Section 2 Lessons
    {
      id: c1s2l1Id,
      section_id: c1s2Id,
      title: 'Declaring Functions',
      order: 1,
      content: 'Functions encapsulate reusable code. They can be created as declarations (function foo() {}) or expressions (const foo = () => {}). Arrow functions provide shorthand syntax and lexical bindings.'
    },
    {
      id: c1s2l2Id,
      section_id: c1s2Id,
      title: 'Scope, Context & Closures',
      order: 2,
      content: 'Scope determines variable visibility. Closures occur when an inner function retains access to its outer lexical scope even after the outer function finishes executing.'
    },
    {
      id: c1s2l3Id,
      section_id: c1s2Id,
      title: 'JS Objects & Arrays',
      order: 3,
      content: 'Arrays are ordered lists, and objects store keyed values. Essential methods include map, filter, and reduce for arrays, and Object.keys/Object.values for working with object states.'
    },

    // Course 2 Section 1 Lessons
    {
      id: c2s1l1Id,
      section_id: c2s1Id,
      title: 'What is a Relational DB?',
      order: 1,
      content: 'Relational databases store structured records in tables consisting of rows and columns. They use unique Primary Keys to identify rows and Foreign Keys to establish relations.'
    },
    {
      id: c2s1l2Id,
      section_id: c2s1Id,
      title: 'Designing Schemas & Tables',
      order: 2,
      content: 'Schema design requires careful structure planning. Normalization processes (1NF, 2NF, 3NF) reduce database redundancy and ensure column data integrity.'
    },
    {
      id: c2s1l3Id,
      section_id: c2s1Id,
      title: 'Primary & Foreign Keys',
      order: 3,
      content: 'A primary key uniquely identifies a table record. A foreign key links records in different tables together. Referential integrity rules prevent orphan rows.'
    },
    // Course 2 Section 2 Lessons
    {
      id: c2s2l1Id,
      section_id: c2s2Id,
      title: 'Basic SELECT Queries',
      order: 1,
      content: 'SQL (Structured Query Language) queries fetch records. Use SELECT columns FROM table WHERE conditions to query specific data. Filter with operators like LIKE, IN, and BETWEEN.'
    },
    {
      id: c2s2l2Id,
      section_id: c2s2Id,
      title: 'INNER & OUTER Joins',
      order: 2,
      content: 'JOINS merge tables. INNER JOIN returns rows with matches in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right. RIGHT/FULL OUTER return expanded matches.'
    },
    {
      id: c2s2l3Id,
      section_id: c2s2Id,
      title: 'Aggregations & Grouping',
      order: 3,
      content: 'Aggregate functions compute summaries (COUNT, SUM, AVG, MIN, MAX). Use GROUP BY to slice aggregates by column values, and HAVING to filter aggregated results.'
    },

    // Course 3 Section 1 Lessons
    {
      id: c3s1l1Id,
      section_id: c3s1Id,
      title: 'Understanding Cash Flow',
      order: 1,
      content: 'Cash flow is income minus expenses. Tracking cash flow reveals spending habits. Maintaining a positive cash flow is the prerequisite to wealth creation.'
    },
    {
      id: c3s1l2Id,
      section_id: c3s1Id,
      title: 'The 50/30/20 Budgeting Rule',
      order: 2,
      content: 'A standard budgeting guide: allocate 50% of after-tax income to Needs (housing, groceries), 30% to Wants (dining, hobbies), and 20% to Savings or debt payoff.'
    },
    {
      id: c3s1l3Id,
      section_id: c3s1Id,
      title: 'Emergency Funds & Liquidity',
      order: 3,
      content: 'An emergency fund secures your financial foundation. It should cover 3 to 6 months of expenses, stored in a liquid, safe account like a High-Yield Savings Account.'
    },
    // Course 3 Section 2 Lessons
    {
      id: c3s2l1Id,
      section_id: c3s2Id,
      title: 'What is Inflation?',
      order: 1,
      content: 'Inflation is the general rise in prices, which erodes purchasing power. To grow real wealth, investment returns must exceed the rate of inflation.'
    },
    {
      id: c3s2l2Id,
      section_id: c3s2Id,
      title: 'Compound Interest Magic',
      order: 2,
      content: 'Compound interest earns interest on interest. The Rule of 72 estimates investment doubling time: divide 72 by the annual return percentage (e.g. 72 / 8 = 9 years).'
    },
    {
      id: c3s2l3Id,
      section_id: c3s2Id,
      title: 'Stocks, Bonds, & Index Funds',
      order: 3,
      content: 'Stocks represent company ownership (higher risk/reward). Bonds represent loans (fixed income). Low-cost index funds track markets and offer diversified portfolio options.'
    }
  ]);

  // 5. Insert 5 Quiz Questions per Course (Total 15 Questions)
  await knex('quiz_questions').insert([
    // Course 1 (JS) Quiz Questions - Attached to lessons 1-5
    {
      id: crypto.randomUUID(),
      lesson_id: c1s1l1Id,
      question_text: 'Which variable declaration keyword prevents re-assignment in JavaScript?',
      options: JSON.stringify(['var', 'let', 'const', 'declare']),
      correct_option_idx: 2
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c1s1l2Id,
      question_text: 'Which comparison operator checks for strict equality of both value and data type?',
      options: JSON.stringify(['==', '===', '=', '!=']),
      correct_option_idx: 1
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c1s1l3Id,
      question_text: 'Which keyword immediately exits a loop, skipping all remaining iterations?',
      options: JSON.stringify(['break', 'continue', 'return', 'exit']),
      correct_option_idx: 0
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c1s2l1Id,
      question_text: 'What is the default return value of a JavaScript function that does not contain a return statement?',
      options: JSON.stringify(['null', 'undefined', '0', 'false']),
      correct_option_idx: 1
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c1s2l2Id,
      question_text: 'What term defines a function retaining access to its lexical environment even after its parent function completes?',
      options: JSON.stringify(['closure', 'callback', 'scope chaining', 'hoisting']),
      correct_option_idx: 0
    },

    // Course 2 (Databases) Quiz Questions - Attached to lessons 1-5
    {
      id: crypto.randomUUID(),
      lesson_id: c2s1l1Id,
      question_text: 'Which column type is used to uniquely identify each row in a database table?',
      options: JSON.stringify(['Primary Key', 'Foreign Key', 'Index Key', 'Candidate Key']),
      correct_option_idx: 0
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c2s1l2Id,
      question_text: 'What is the primary goal of database normalization processes?',
      options: JSON.stringify(['Increase query performance', 'Reduce data redundancy', 'Create table relationships', 'Encapsulate queries']),
      correct_option_idx: 1
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c2s1l3Id,
      question_text: 'What happens when referential integrity is violated on ON DELETE CASCADE?',
      options: JSON.stringify([
        'Parent row cannot be deleted',
        'Referencing child rows are deleted automatically',
        'Foreign keys are set to NULL',
        'An error is thrown without database changes'
      ]),
      correct_option_idx: 1
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c2s2l1Id,
      question_text: 'Which SQL clause is used to filter records based on specific row conditions?',
      options: JSON.stringify(['SELECT', 'FROM', 'WHERE', 'ORDER BY']),
      correct_option_idx: 2
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c2s2l2Id,
      question_text: 'Which SQL join returns all records from both tables matching where possible, or filled with nulls?',
      options: JSON.stringify(['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN']),
      correct_option_idx: 3
    },

    // Course 3 (Finance) Quiz Questions - Attached to lessons 1-5
    {
      id: crypto.randomUUID(),
      lesson_id: c3s1l1Id,
      question_text: 'What is the equation for net cash flow?',
      options: JSON.stringify(['Income + Expenses', 'Income - Expenses', 'Expenses - Savings', 'Assets + Liabilities']),
      correct_option_idx: 1
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c3s1l2Id,
      question_text: 'In the 50/30/20 budget rule, what allocation percentage belongs to Wants?',
      options: JSON.stringify(['50%', '30%', '20%', '10%']),
      correct_option_idx: 1
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c3s1l3Id,
      question_text: 'How many months of basic expenses is typically recommended to keep in a liquid emergency fund?',
      options: JSON.stringify(['1 month', '3 to 6 months', '12 months', '2 years']),
      correct_option_idx: 1
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c3s2l1Id,
      question_text: 'What term defines the general rise in prices and cost of living which erodes currency purchasing power?',
      options: JSON.stringify(['Inflation', 'Deflation', 'Stagflation', 'Depreciation']),
      correct_option_idx: 0
    },
    {
      id: crypto.randomUUID(),
      lesson_id: c3s2l2Id,
      question_text: 'According to the Rule of 72, how many years does it take to double money at a 6% return rate?',
      options: JSON.stringify(['6 years', '12 years', '72 years', '8 years']),
      correct_option_idx: 1
    }
  ]);
}
