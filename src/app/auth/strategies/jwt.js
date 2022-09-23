const { Exception } = require('utils');
const { jwt } = require('config-keys');
const { User } = require('../../Models');
const { Strategy } = require('passport-custom');
const jsonwebtoken = require('jsonwebtoken');

const { Access_Token_Expired, Invalid_Access_Token, Unauthenticated } = Exception.auth;

module.exports = new Strategy(({ isSocket, handshake, headers }, done) => {
	let accessToken;
	if (isSocket === true) accessToken = handshake?.auth?.accessToken;
	else accessToken = headers.authorization?.split(' ')[1];
	if (!accessToken) return done(Unauthenticated);

	jsonwebtoken.verify(accessToken, jwt.accessToken.key, async (err, payload) => {
		if (err?.name === 'TokenExpiredError') return done(Access_Token_Expired);
		if (err) return done(Invalid_Access_Token);

		const user = await User.auth({ _id: payload.id });
		if (!user) return done(Invalid_Access_Token);

		done(null, user);
	});
});
