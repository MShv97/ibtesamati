const { httpStatus } = require('../../constants');
const codes = require('./codes');
const Exception = require('../Exception');

const model = 'database';
const code = codes[model];

const errors = {
	Database_Conflict: (err) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: `Duplication conflict.`,
		args: err.keyValue,
	}),
	Database_Constraint: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Reference non existing data.',
	},
};

Exception.add(model, code, errors);
