const faker = require('faker')
const knex = require('../db/knex')

async function run(){
  await knex('replies').del()
  await knex('posts').del()
  await knex('users').del()

  const users = []
  for (let i=0;i<10;i++){
    const [u] = await knex('users').insert({ name: faker.name.findName(), email: faker.internet.email() }).returning('*')
    users.push(u)
  }

  for (let i=0;i<50;i++){
    const u = users[Math.floor(Math.random()*users.length)]
    const [post] = await knex('posts').insert({ title: faker.lorem.sentence(), content: faker.lorem.paragraphs(1), author_id: u.id, votes: Math.floor(Math.random()*20) }).returning('*')
    const repliesCount = Math.floor(Math.random()*6)
    for (let j=0;j<repliesCount;j++){
      const ru = users[Math.floor(Math.random()*users.length)]
      await knex('replies').insert({ post_id: post.id, content: faker.lorem.sentences(), author_id: ru.id })
    }
  }
  console.log('sample data generated')
  process.exit(0)
}

run().catch(e=>{ console.error(e); process.exit(1) })
