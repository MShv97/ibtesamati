const mongoose = require('mongoose');
const { findAndCount, aggregateAndCount, attributes, metadata } = require('./plugins');
const { accessibleRecordsPlugin, accessibleFieldsPlugin } = require('@casl/mongoose');
const {
	database: { mongodb },
} = require('config-keys');

mongoose.plugin(metadata);
mongoose.plugin(accessibleRecordsPlugin);
mongoose.plugin(accessibleFieldsPlugin);
mongoose.plugin(findAndCount);
mongoose.plugin(attributes);
mongoose.plugin(aggregateAndCount);
mongoose.plugin(require('mongoose-lean-virtuals'));
mongoose.plugin(require('mongoose-lean-getters'));
mongoose.plugin(require('mongoose-autopopulate'));

mongoose.set('debug', mongodb.debug);
module.exports = {
	connect: (uri, dbName) =>
		mongoose.connect(uri || mongodb.uri, {
			bufferCommands: false,
			dbName: dbName || mongodb.dbName,
		}),
	utils: require('./utils'),
};
