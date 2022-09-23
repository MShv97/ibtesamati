const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { defaultOptions } = require('database').utils;

const File = new Schema(
	{
		name: { type: String, select: false, required: true },
		originalName: { type: String, select: false, required: true },
		size: { type: Number, select: false, required: true },
		mimeType: { type: String, select: false, required: true },
		isPrivate: { type: Boolean, default: false, required: true },
		buffer: { type: Buffer, required: true },
	},
	defaultOptions({})
);

module.exports = mongoose.model('File', File, 'File');
