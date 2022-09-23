const Joi = require('joi');
const { joiSchema } = require('utils');
const { Product } = require('../Models');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });
const files = {
	images: Joi.file({
		mimetype: Joi.string().valid('image/jpeg', 'image/png'),
		size: Joi.number()
			.integer()
			.max(1024 * 1024 * 5),
	}).max(4),
};

const save = Joi.object({
	files,
	body: {
		name: Joi.string().required(),
		description: Joi.string().required(),
		price: Joi.number().greater(0).allow(null),
		fullPrice: Joi.number().greater(0).required(),
		isActive: Joi.boolean(),
		isSpecial: Joi.boolean(),
		warranty: Joi.object({
			value: Joi.number().integer().min(1).required(),
			unit: Joi.enum(Product.WARRANTY_UNITS).required(),
		}).allow(null),
	},
});

const update = Joi.object({
	params,
	body: Joi.object({
		name: Joi.string(),
		description: Joi.string(),
		price: Joi.number().greater(0).allow(null),
		fullPrice: Joi.number().greater(0),
		isActive: Joi.boolean(),
		isSpecial: Joi.boolean(),
		images: Joi.array().items(Joi.string()).single(),
		warranty: Joi.object({
			value: Joi.number().integer().min(1).required(),
			unit: Joi.enum(Product.WARRANTY_UNITS).required(),
		}).allow(null),
	}).min(1),
});

const uploadFiles = Joi.object({ params, files: Joi.object(files).min(1) });
const deleteFile = Joi.object({ params: { ...params, fileId: Joi.objectId().required() } });

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		name: Joi.search(),
		price: Joi.comparison(),
		fullPrice: Joi.comparison(),
		isActive: Joi.boolean(),
		isSpecial: Joi.boolean(),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	update: joiSchema.middleware(update),
	uploadFiles: joiSchema.middleware(uploadFiles),
	deleteFile: joiSchema.middleware(deleteFile),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
