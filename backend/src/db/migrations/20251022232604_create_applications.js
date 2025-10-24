// backend/src/db/migrations/20251022232604_create_applications.js

/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  await knex.schema.createTable('applications', (t) => {
    t.increments('id').primary();

    // FK → users.id (предполагается, что таблица users уже есть)
    t
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index();

    // ---------- Step 1 ----------
    t.string('first_name', 100).notNullable();
    t.string('last_name', 100).notNullable();
    t.string('email', 255).notNullable();          // снимок email
    t.string('phone', 50).notNullable();
    t.text('current_address').notNullable();
    t.date('date_of_birth').notNullable();

    // Раньше был ENUM — теперь обычная строка
    t.string('position_applied_for', 100).notNullable();

    t.string('resume_path', 1024).notNullable();
    t.string('linkedin_profile', 1024);            // optional

    // ---------- Step 2 ----------
    // Раньше был ENUM — теперь обычная строка
    t.string('education_level', 100).notNullable();

    t.integer('years_of_experience').notNullable().defaultTo(0);
    t.jsonb('skills').notNullable().defaultTo('[]');

    t.string('previous_employer', 255);
    t.string('current_job_title', 255);

    // Раньше был ENUM — теперь обычная строка
    t.string('notice_period', 100).notNullable();

    t.integer('expected_salary');                  // plain number
    t.timestamp('availability_for_interview', { useTz: false });

    // Раньше был ENUM — теперь обычная строка
    t.string('preferred_location', 100);

    t.text('cover_letter');

    // Раньше был ENUM — теперь обычная строка
    t.string('source_of_application', 100).notNullable();

    t.timestamps(true, true); // created_at, updated_at
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('applications');
};
