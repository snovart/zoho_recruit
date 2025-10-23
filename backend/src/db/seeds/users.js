// backend/src/db/seeds/users.js
const bcrypt = require('bcryptjs');

/** Hash helper */
const hash = (plain) => bcrypt.hashSync(plain, 10);

exports.seed = async function (knex) {
  // wipe
  await knex('users').del();

  // seed: 1 admin + 5 users
  await knex('users').insert([
    { id: 1, email: 'admin@example.com', password_hash: hash('Admin123!'), role: 'admin', is_active: true },
    { id: 2, email: 'user1@example.com', password_hash: hash('User123!'),  role: 'user',  is_active: true },
    { id: 3, email: 'user2@example.com', password_hash: hash('User123!'),  role: 'user',  is_active: true },
    { id: 4, email: 'user3@example.com', password_hash: hash('User123!'),  role: 'user',  is_active: true },
    { id: 5, email: 'user4@example.com', password_hash: hash('User123!'),  role: 'user',  is_active: true },
    { id: 6, email: 'user5@example.com', password_hash: hash('User123!'),  role: 'user',  is_active: true },
  ]);

  // fix sequence after manual ids
  await knex.raw(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);
};
