require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const passport = require('./auth/passport')
const authMiddleware = require('./middleware/auth')

const postsRouter = require('./routes/posts.knex')
const authRouter = require('./routes/auth')
const aiRouter = require('./routes/ai')

async function start(){
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(passport.initialize())
  app.use(authMiddleware)

  app.use('/posts', postsRouter)
  app.use('/auth', authRouter)
  app.use('/', aiRouter)

  const server = http.createServer(app)
  const io = new Server(server, { cors: { origin: '*' } })
  app.set('io', io)
  io.on('connection', (socket) => console.log('socket connected', socket.id))

  const PORT = process.env.PORT || 4000
  server.listen(PORT, () => console.log(`Backend listening ${PORT}`))
}

start()
