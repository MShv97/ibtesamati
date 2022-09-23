const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'about';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'About not found.',
	},
};

Exception.add(model, code, errors);
