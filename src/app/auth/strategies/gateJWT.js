const { Exception } = require('utils');
const { jwt } = require('config-keys');
const { Gate } = require('../../Models');
const { Strategy } = require('passport-custom');
const jsonwebtoken = require('jsonwebtoken');

const { Access_Token_Expired, Invalid_Access_Token } = Exception.auth;

module.exports = new Strategy(({ isSocket, handshake, headers }, done) => {
	let accessToken;
	if (isSocket === true) accessToken = handshake?.auth?.accessToken;
	else accessToken = headers.authorization?.split(' ')[1];

	jsonwebtoken.verify(accessToken, jwt.accessToken.key, async (err, payload) => {
		if (err?.name === 'TokenExpiredError') return done(Access_Token_Expired);
		if (err) return done(Invalid_Access_Token);

		const gate = await Gate.findOne({ _id: payload.id, deleted: false }, '-address -geo');
		if (!gate) return done(Invalid_Access_Token);

		done(null, gate.toObject());
	});
});
