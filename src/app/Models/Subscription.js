const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Subscription = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		price: { type: Number, required: true },
		discount: { type: Number, default: 0, required: true },
		isActive: { type: Boolean, default: true, required: true },
		duration: { value: { type: Number }, unit: { type: String } },
	},
	defaultOptions({ timestamps: true })
);

Subscription.statics = {
	DURATION_UNITS: ['month', 'day', 'months', 'days'],
};

module.exports = mongoose.model('Subscription', Subscription, 'Subscription');
