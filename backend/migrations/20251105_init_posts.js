exports.up = async function(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name');
    t.string('email').unique();
    t.string('provider');
    t.boolean('is_instructor').defaultTo(false);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('posts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('title').notNullable();
    t.text('content').notNullable();
    t.uuid('author_id').references('id').inTable('users').onDelete('SET NULL');
    t.integer('votes').defaultTo(0);
    t.boolean('answered').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.specificType('search_vector', 'tsvector');
  });

  await knex.schema.createTable('replies', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    t.text('content').notNullable();
    t.uuid('author_id').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.raw('CREATE INDEX IF NOT EXISTS posts_search_idx ON posts USING GIN(search_vector);');

  // ✅ Drop + recreate function (Postgres 15 safe)
  await knex.raw('DROP FUNCTION IF EXISTS posts_search_vector_update() CASCADE;');
  await knex.raw(`
    CREATE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.content,''));
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER posts_search_vector_update_trigger
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW EXECUTE PROCEDURE posts_search_vector_update();
  `);
};

exports.down = async function(knex) {
  await knex.raw('DROP TRIGGER IF EXISTS posts_search_vector_update_trigger ON posts;');
  await knex.raw('DROP FUNCTION IF EXISTS posts_search_vector_update();');
  await knex.schema.dropTableIfExists('replies');
  await knex.schema.dropTableIfExists('posts');
  await knex.schema.dropTableIfExists('users');
};
