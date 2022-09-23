const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { defaultOptions } = require('database').utils;
const Point = require('./Point');
const _ = require('lodash');

module.exports = (excludes = []) => {
	const attributes = {
		_id: false,
		country: { type: String },
		province: { type: String },
		city: { type: String },
		postalCode: { type: String },
		location: { type: String },
		geo: { type: Point, index: '2dsphere' },
	};
	const Address = new Schema(_.omit(attributes, excludes), defaultOptions({ timestamps: false, hide: ['geo'] }));

	if (excludes.includes('geo')) return Address;

	Address.virtual('longitude').get(function () {
		if (!this.geo?.coordinates?.length) return;
		return this.geo.coordinates[0];
	});

	Address.virtual('latitude').get(function () {
		if (!this.geo?.coordinates?.length) return;
		return this.geo.coordinates[1];
	});

	return Address;
};
