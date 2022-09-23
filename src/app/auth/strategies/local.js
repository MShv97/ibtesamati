const { Exception } = require('utils');
const { User } = require('../../Models');
const { Strategy } = require('passport-custom');
const _ = require('lodash');

function parseError(data) {
	if (data.email) return Exception.auth.Invalid_Auth_Email_Password;
	if (data.username) return Exception.auth.Invalid_Auth_Username_Password;
	if (data.phone && data.code) return Exception.auth.Invalid_Auth_Phone_Code;
	if (data.phone && data.password) return Exception.auth.Invalid_Auth_Phone_Password;
}

module.exports = new Strategy(async ({ body: data }, done) => {
	const conditions = (() => {
		const result = { ..._.pick(data, ['phone']) };

		if (data.email) result['email'] = new RegExp(`${data.email}`, 'i');
		if (data.username) result['username'] = new RegExp(`${data.username}`, 'i');
		if (data.code) result['smsAttempts'] = { $elemMatch: { code: data.code, phone: data.phone } };

		return result;
	})();

	const user = await User.logIn(conditions);
	if (!user) return done(parseError(data));

	if (data.password && (await user.verifyPassword(data.password)) !== true) return done(parseError(data));

	done(null, user.toObject());
});
