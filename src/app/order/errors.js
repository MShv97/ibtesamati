const { Exception, httpStatus } = require('utils');
const codes = require('../errCodes');

const model = 'order';
const code = codes[model];

const errors = {
	Not_Found: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '01',
		msg: 'Order not found.',
	},

	Process_Unable: (status) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '02',
		msg: `Can not process. Order${status.endsWith('ing') ? ' is' : ''} ${status.toLowerCase()}.`,
	}),

	Process_Done: (status) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '03',
		msg: `No more processing. Order${status.endsWith('ing') ? ' is' : ''} ${status.toLowerCase()}.`,
	}),

	Invalid_Status: (status, operation) => ({
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '04',
		msg: `Can not ${operation} order because its status is '${status}'.`,
		args: { status, operation },
	}),

	/** ############################# **
	 **	#  Order Validation Errors  # **
	 ** ############################# **/
	Product_Not_Available: (products, found) => {
		const foundIds = found.map((val) => val._id.toString());
		return {
			httpStatus: httpStatus.BAD_REQUEST,
			code: code + '20',
			msg: 'Some Products not found or not available.',
			args: products.reduce((acc, cur, index) => {
				if (!foundIds.includes(cur.id.toString())) acc.push({ value: cur.id, path: `products[${index}].id` });
				return acc;
			}, []),
		};
	},

	Active_Subscription: {
		httpStatus: httpStatus.BAD_REQUEST,
		code: code + '21',
		msg: 'Can not order new subscription if user has an active one.',
	},

	/** ################################################################## **/
};

Exception.add(model, code, errors);
