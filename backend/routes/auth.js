const express = require('express')
const router = express.Router()
const passport = require('../auth/passport')
const jwt = require('jsonwebtoken')

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }))

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  const user = req.user
  const token = jwt.sign({ id: user.id, name: user.name, is_instructor: user.is_instructor }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?token=${token}`)
})

module.exports = router
