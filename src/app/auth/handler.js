const { httpStatus } = require('utils');
const AuthService = require('./service');

module.exports = {
	signUp: async (req, res) => {
		const { body: data } = req;
		const result = await AuthService.signUp(data);
		res.status(httpStatus.CREATED).json(result);
	},

	otp: async (req, res) => {
		const { user } = req;
		const result = await AuthService.otp(user);
		res.status(httpStatus.OK).json(result);
	},

	refreshToken: async (req, res) => {
		const { body: data } = req;
		const result = await AuthService.refreshToken(data);
		res.status(httpStatus.UPDATED).json(result);
	},
};
