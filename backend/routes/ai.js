const express = require('express')
const router = express.Router()
const axios = require('axios')
const knex = require('../db/knex')

// POST /suggest { text }
router.post('/suggest', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'text required' })
  try {
    const rows = await knex.raw(
      `SELECT p.*, ts_rank_cd(p.search_vector, plainto_tsquery(?)) AS rank
       FROM posts p WHERE p.search_vector @@ plainto_tsquery(?) ORDER BY rank DESC LIMIT 5`,
      [text, text]
    )
    let suggestion = null
    if (process.env.OPENAI_API_KEY) {
      const prompt = `Reply to this learner question briefly and helpfully:\n\n${text}`
      const r = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: prompt }],
        max_tokens: 200
      }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } })
      suggestion = r.data.choices?.[0]?.message?.content || null
    }

    res.json({ similar: rows.rows, suggestion })
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }) }
})

// POST /posts/:id/summarize
router.post('/posts/:id/summarize', async (req,res) => {
  const id = req.params.id
  try {
    const [post] = await knex('posts').where({ id })
    if (!post) return res.status(404).json({ error:'not found' })
    const replies = await knex('replies').where({ post_id: id }).orderBy('created_at','asc')
    if (!process.env.OPENAI_API_KEY) return res.status(400).json({ error: 'OPENAI_API_KEY not configured' })
    const content = `Post: ${post.title}\n\n${post.content}\n\nReplies:\n${replies.map(r => '- ' + r.content).join('\n')}`
    const r = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role:'user', content: `Summarize the discussion and propose a concise answer:\n\n${content}` }],
      max_tokens: 300
    }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } })
    const summary = r.data.choices?.[0]?.message?.content
    res.json({ summary })
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }) }
})

module.exports = router
