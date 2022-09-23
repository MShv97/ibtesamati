const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		fullPrice: { type: Number, required: true },
		price: { type: Number },
		isActive: { type: Boolean, default: true, required: true },
		isSpecial: { type: Boolean, default: false, required: true },
		warranty: { value: { type: Number }, unit: { type: String } },
		images: { type: [Schema.Types.ObjectId], ref: 'File' },
	},
	defaultOptions({ timestamps: true, hide: [(doc) => !Array.isArray(doc.images) && delete doc.images] })
);

Product.statics = {
	WARRANTY_UNITS: ['month', 'day', 'months', 'days'],
};

module.exports = mongoose.model('Product', Product, 'Product');
