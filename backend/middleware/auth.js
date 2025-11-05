const jwt = require('jsonwebtoken')
const knex = require('../db/knex')

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return next()
  const parts = auth.split(' ')
  if (parts.length !==2) return next()
  const token = parts[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await knex('users').where({ id: payload.id }).first()
    if (user) req.user = user
  } catch (err) { }
  return next()
}

module.exports = authMiddleware
