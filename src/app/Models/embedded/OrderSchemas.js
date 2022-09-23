const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const priceType = (required = true) => ({
	type: Number,
	min: 0,
	required,
	set: (value) => (value ? Math.round(value * 100) / 100 : value),
});

const Product = new Schema(
	{
		_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
		name: { type: String, required: true },
		qty: { type: Number, default: 1 },
		price: { type: Number },
		warranty: { type: Object },
	},
	defaultOptions({})
);

const Subscription = new Schema(
	{
		_id: { type: Schema.Types.ObjectId, ref: 'Subscription' },
		name: { type: String },
		price: { type: Number },
		duration: { type: Object },
	},
	defaultOptions({ hide: ['duration'] })
);

module.exports = { Product, Subscription, priceType };
