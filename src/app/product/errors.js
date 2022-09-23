const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'product';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Product not found.',
	},

	Images_Sort_Conflict: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: 'Length or values of images array are not equal.',
	},
};

Exception.add(model, code, errors);
