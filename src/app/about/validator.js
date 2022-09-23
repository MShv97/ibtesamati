const Joi = require('joi');
const { joiSchema } = require('utils');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const update = Joi.object({
	body: Joi.object({
		description: Joi.string(),
		facebook: Joi.string().allow(null),
		instagram: Joi.string().allow(null),
		snapchat: Joi.string().allow(null),
		linkedIn: Joi.string().allow(null),
		whatsApp: Joi.array().items(Joi.string()).single(),
		phones: Joi.array().items(Joi.string()).single(),
		mobiles: Joi.array().items(Joi.string()).single(),
	}).min(1),
});

const get = Joi.object({
	query: {},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	update: joiSchema.middleware(update),
	get: joiSchema.middleware(get),
};
