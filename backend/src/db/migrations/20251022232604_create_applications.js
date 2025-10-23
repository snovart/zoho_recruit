/** @param {import('knex').Knex} knex */
exports.up = async function up(knex) {
  // enum sets
  const POSITION_ENUM  = ['software_engineer','data_analyst','qa_engineer','ux_designer','project_manager'];
  const EDUCATION_ENUM = ['high_school','associates_degree','bachelors_degree','masters_degree','doctorate'];
  const NOTICE_ENUM    = ['immediate','1_week','2_weeks','1_month','more_than_1_month'];
  const LOCATION_ENUM  = ['new_york','san_francisco','chicago','austin','remote'];
  const SOURCE_ENUM    = ['company_website','linkedin','job_board','referral','other'];

  await knex.schema.createTable('applications', (t) => {
    t.increments('id').primary();

    // FK → users.id
    t
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index();

    // Stage 1
    t.string('first_name', 100).notNullable();
    t.string('last_name', 100).notNullable();

    // email в заявке храним как "снимок", БЕЗ unique
    t.string('email', 255).notNullable();

    t.string('phone', 50).notNullable();
    t.text('current_address').notNullable();
    t.date('date_of_birth').notNullable();

    t.enu('position_applied_for', POSITION_ENUM, {
      useNative: true,
      enumName: 'app_position_enum',
    }).notNullable();

    t.string('resume_path', 1024).notNullable(); // путь к файлу резюме
    t.string('linkedin_profile', 1024);          // опционально

    // Stage 2
    t.enu('education_level', EDUCATION_ENUM, {
      useNative: true,
      enumName: 'app_education_enum',
    }).notNullable();

    t.integer('years_of_experience').notNullable().defaultTo(0);
    t.jsonb('skills').notNullable().defaultTo('[]');

    t.string('previous_employer', 255);
    t.string('current_job_title', 255);

    t.enu('notice_period', NOTICE_ENUM, {
      useNative: true,
      enumName: 'app_notice_enum',
    }).notNullable();

    t.integer('expected_salary'); // при желании — minor units
    t.timestamp('availability_for_interview', { useTz: false });

    t.enu('preferred_location', LOCATION_ENUM, {
      useNative: true,
      enumName: 'app_location_enum',
    });

    t.text('cover_letter');

    t.enu('source_of_application', SOURCE_ENUM, {
      useNative: true,
      enumName: 'app_source_enum',
    }).notNullable();

    t.timestamps(true, true); // created_at, updated_at
  });
};

/** @param {import('knex').Knex} knex */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('applications');

  // drop enum types
  await knex.schema.raw('DROP TYPE IF EXISTS app_position_enum');
  await knex.schema.raw('DROP TYPE IF EXISTS app_education_enum');
  await knex.schema.raw('DROP TYPE IF EXISTS app_notice_enum');
  await knex.schema.raw('DROP TYPE IF EXISTS app_location_enum');
  await knex.schema.raw('DROP TYPE IF EXISTS app_source_enum');
};
