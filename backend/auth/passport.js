const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const knex = require('../db/knex')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_REDIRECT
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value
    const name = profile.displayName
    let user = await knex('users').where({ email }).first()
    if (!user) {
      [user] = await knex('users').insert({ name, email, provider: 'google' }).returning('*')
    }
    done(null, user)
  } catch (err) { done(err) }
}))

module.exports = passport
