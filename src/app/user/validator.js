const Joi = require('joi');
const { joiSchema } = require('utils');
const { User } = require('../Models');
const _ = require('lodash');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });
const files = {
	avatar: Joi.file({
		mimetype: Joi.string().valid('image/jpeg', 'image/png'),
		size: Joi.number()
			.integer()
			.max(1024 * 1024 * 5),
	}).max(1),
};

const save = Joi.object({
	body: {
		type: Joi.enum(_.omit(User.TYPES, ['SYSTEM'])).required(),
		fullName: Joi.string().required(),
		email: Joi.string().email(),
		phone: Joi.phone().required(),
		password: Joi.password().required(),
	},
});

const update = Joi.object({
	params,
	files,
	body: Joi.object({
		fullName: Joi.string(),
		email: Joi.string().email(),
		phone: Joi.phone(),
		password: Joi.password(),
	}),
});

const updateMine = Joi.object({
	files,
	body: Joi.object({
		fullName: Joi.string(),
		email: Joi.string().email(),
		phone: Joi.phone(),
	}).min(1),
});

const changePassword = Joi.object({ body: { old: Joi.string().required(), new: Joi.password().required() } });

const deleteFile = Joi.object({ params: { ...params, fileId: Joi.objectId().required() } });

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		type: Joi.array()
			.items(Joi.enum(_.omit(User.TYPES, ['SYSTEM'])))
			.single(),
		fullName: Joi.search(),
		email: Joi.search(),
		phone: Joi.search(),
		isActive: Joi.boolean(),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	updateMine: joiSchema.middleware(updateMine),
	deleteFile: joiSchema.middleware(deleteFile),
	changePassword: joiSchema.middleware(changePassword),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
