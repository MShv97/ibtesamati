const Joi = require('joi');
const { joiSchema } = require('utils');
const { Subscription } = require('../Models');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const save = Joi.object({
	body: {
		name: Joi.string().required(),
		description: Joi.string().required(),
		price: Joi.number().greater(0).required(),
		discount: Joi.number().min(0).less(1).required(),
		isActive: Joi.boolean(),
		duration: Joi.object({
			value: Joi.number().integer().min(1).required(),
			unit: Joi.enum(Subscription.DURATION_UNITS).required(),
		}).required(),
	},
});

const update = Joi.object({
	params,
	body: Joi.object({
		name: Joi.string(),
		description: Joi.string(),
		price: Joi.number().greater(0),
		discount: Joi.number().min(0).less(1),
		isActive: Joi.boolean(),
		duration: Joi.object({
			value: Joi.number().integer().min(1).required(),
			unit: Joi.enum(Subscription.DURATION_UNITS).required(),
		}),
	}).min(1),
});

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		name: Joi.search(),
		price: Joi.comparison(),
		isActive: Joi.boolean(),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
