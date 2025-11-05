const express = require('express')
const router = express.Router()
const knex = require('../db/knex')

// List posts, optional ?search=term
router.get('/', async (req, res) => {
  const { search } = req.query
  try {
    if (search) {
      const rows = await knex.raw(
        `SELECT p.*, u.name as author_name, ts_rank_cd(p.search_vector, plainto_tsquery(?)) AS rank
         FROM posts p LEFT JOIN users u ON p.author_id = u.id
         WHERE p.search_vector @@ plainto_tsquery(?)
         ORDER BY rank DESC, votes DESC, created_at DESC
         LIMIT 200`,
        [search, search]
      )
      return res.json(rows.rows)
    }

    const rows = await knex('posts')
      .leftJoin('users', 'posts.author_id', 'users.id')
      .select('posts.*', 'users.name as author_name')
      .orderBy([{ column: 'votes', order: 'desc' }, { column: 'created_at', order: 'desc' }])
    res.json(rows)
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }) }
})

// Create post
router.post('/', async (req, res) => {
  const { title, content, author } = req.body
  try {
    let author_id = null
    if (req.user) author_id = req.user.id
    else if (author) {
      const [u] = await knex('users').insert({ name: author }).returning('*')
      author_id = u.id
    }
    const [post] = await knex('posts').insert({ title, content, author_id }).returning('*')
    res.status(201).json(post)
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }) }
})

// Get single post with replies
router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const [post] = await knex('posts').where('posts.id', id).leftJoin('users','posts.author_id','users.id').select('posts.*','users.name as author_name')
    if (!post) return res.status(404).json({ error: 'not found' })
    const replies = await knex('replies').where({ post_id: id }).leftJoin('users','replies.author_id','users.id').select('replies.*','users.name as author_name').orderBy('created_at','asc')
    post.replies = replies
    res.json(post)
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }) }
})

// Reply
router.post('/:id/reply', async (req, res) => {
  const postId = req.params.id
  const { content, author } = req.body
  try {
    let author_id = null
    if (req.user) author_id = req.user.id
    else if (author) {
      const [u] = await knex('users').insert({ name: author }).returning('*')
      author_id = u.id
    }
    const [reply] = await knex('replies').insert({ post_id: postId, content, author_id }).returning('*')
    res.status(201).json(reply)
    if (req.app.get('io')) req.app.get('io').emit('new_reply', { postId, reply })
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }) }
})

// Upvote
router.post('/:id/upvote', async (req, res) => {
  const id = req.params.id
  try {
    const updated = await knex('posts').where({ id }).increment('votes', 1).returning('votes')
    const votes = updated[0].votes
    if (req.app.get('io')) req.app.get('io').emit('upvote', { postId: id, votes })
    res.json({ votes })
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }) }
})

// Mark answered (instructor only)
router.post('/:id/answer', async (req, res) => {
  const id = req.params.id
  try {
    if (!req.user || !req.user.is_instructor) return res.status(403).json({ error: 'forbidden' })
    await knex('posts').where({ id }).update({ answered: true })
    if (req.app.get('io')) req.app.get('io').emit('answered', { postId: id })
    res.json({ answered: true })
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }) }
})

module.exports = router
