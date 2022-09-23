const { defaultOptions } = require('database').utils;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Statuses = new Schema(
	{
		status: { type: String, required: true },
		at: { type: Date, default: () => new Date() },
		reason: { type: String },
	},
	defaultOptions({ _id: false })
);

module.exports = Statuses;
