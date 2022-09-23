const { jwt, gateJWT, local } = require('./strategies');
const passport = require('passport');

passport.use('local', local);

passport.use('jwt', jwt);

passport.use('gate-jwt', gateJWT);

module.exports = passport;
