const { Casl } = require('utils');
const { SYSTEM, ADMIN, CUSTOMER } = require('../Models').User.TYPES;

const subject = 'Product';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[ADMIN]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[CUSTOMER]: (user) => {
		return [
			{ subject, action: ['view'], fields: [''] },
			{ subject, action: ['order'], conditions: { isActive: true } },
		];
	},

	undefined: (user) => {
		return [{ subject, action: ['view'], fields: [''] }];
	},
};

Casl.addAbilities(subject, abilities);
