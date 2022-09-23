const { httpStatus } = require('../../constants');
const codes = require('./codes');
const Exception = require('../Exception');

const model = 'validation';
const code = codes[model];

const errors = {
	Validation_Error: (args) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Request validation error',
		args,
	}),

	JSON_Parsing_Error: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'JSON parsing error.',
	},
};

Exception.add(model, code, errors);
