const { httpStatus } = require('../../constants');
const codes = require('./codes');
const Exception = require('../Exception');

const model = 'file';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'File not found.',
	},

	File_Upload_Failed: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Error uploading file.',
	},
};

Exception.add(model, code, errors);
