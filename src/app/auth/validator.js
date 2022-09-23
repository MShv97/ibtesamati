const Joi = require('joi');
const { joiSchema } = require('utils');

const signUp = Joi.object({
	body: {
		fullName: Joi.string().required(),
		phone: Joi.phone().required(),
		email: Joi.string().email(),
		password: Joi.password().required(),
	},
});

const otp = Joi.object({
	body: Joi.object({
		// email: Joi.string(),
		phone: Joi.string().required(),
		password: Joi.string().required(),
	}),
	// .xor('email', 'phone'),
});

const refreshToken = Joi.object({ body: { token: Joi.string().required() } });
const verify = Joi.object({ body: { code: Joi.string().required() } });
const resetPassword = Joi.object({
	body: { email: Joi.string().email().required(), password: Joi.password().required(), code: Joi.string().required() },
});
const resendVerification = Joi.object({ body: { email: Joi.string().email() } });

module.exports = {
	signUp: joiSchema.middleware(signUp),
	otp: joiSchema.middleware(otp),
	verify: joiSchema.middleware(verify),
	resetPassword: joiSchema.middleware(resetPassword),
	resendVerification: joiSchema.middleware(resendVerification),
	refreshToken: joiSchema.middleware(refreshToken),
};
