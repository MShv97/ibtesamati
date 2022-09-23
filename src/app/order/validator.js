const Joi = require('joi');
const { joiSchema } = require('utils');
const { Order, Payment, User } = require('../Models');

const params = { id: Joi.objectId().required() };
const paramId = Joi.object({ params });

const save = ({ user }) => {
	const body = {
		subscription: Joi.objectId(),
		products: Joi.array()
			.min(1)
			.items({
				id: Joi.objectId().required(),
				qty: Joi.number().integer().min(1).default(1),
			})
			.unique((a, b) => a.id === b.id),
	};

	if (user.type !== User.TYPES.CUSTOMER) {
		body['type'] = Joi.enum(Order.TYPES);
		body['user'] = Joi.objectId().required();
		body['discount'] = Joi.number().min(0).max(1);
	}

	return Joi.object({ body: Joi.object(body).xor('products', 'subscription') });
};

const calculate = ({ user }) => {
	const body = {
		subscription: Joi.objectId(),
		products: Joi.array()
			.min(1)
			.items({
				id: Joi.objectId().required(),
				qty: Joi.number().integer().min(1).default(1),
			})
			.unique((a, b) => a.id === b.id),
	};

	if (user.type && user.type !== User.TYPES.CUSTOMER) {
		body['user'] = Joi.objectId().required();
		body['discount'] = Joi.number().min(0).max(1);
	}

	return Joi.object({ body: Joi.object(body).xor('products', 'subscription') });
};

const action = (action) => {
	const { CANCELED, REJECTED, DROPPED } = Order.STATUSES;
	const actionStatus = { cancel: CANCELED, reject: REJECTED, drop: DROPPED };
	return Joi.object({
		params,
		body: {
			status: Joi.string().default(actionStatus[action]).forbidden(),
			reason: Joi.string(),
		},
	});
};

const process = Joi.object({ params, body: { estimation: Joi.date() } });

const getByCriteria = Joi.object({
	query: {
		...joiSchema.common.getByCriteria,
		user: Joi.objectId(),
		isSubscription: Joi.boolean(),
		status: Joi.array().items(Joi.enum(Order.STATUSES)).single(),
		totalPrice: Joi.comparison(),
	},
});

module.exports = {
	paramId: joiSchema.middleware(paramId),
	save: joiSchema.middleware(save),
	calculate: joiSchema.middleware(calculate),
	process: joiSchema.middleware(process),
	action: (val) => joiSchema.middleware(action(val)),
	getByCriteria: joiSchema.middleware(getByCriteria),
};
