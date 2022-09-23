const { httpStatus } = require('../../constants');
const codes = require('./codes');
const Exception = require('../Exception');

const model = 'server';
const code = codes[model];

const errors = {
	Internal_Server_Error: {
		httpStatus: httpStatus.INTERNAL_SERVER_ERROR,
		code: httpStatus.INTERNAL_SERVER_ERROR,
		msg: 'Internal server error.',
	},
};

Exception.add(model, code, errors);
