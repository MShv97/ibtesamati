const Schema = require('mongoose').Schema;

module.exports = new Schema({
	_id: false,
	type: { type: String, default: 'Point', required: true },
	coordinates: { type: Array, required: true },
});
