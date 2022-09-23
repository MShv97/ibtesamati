const { Casl } = require('utils');
const { SYSTEM, ADMIN, CUSTOMER } = require('../Models').User.TYPES;

const subject = 'Subscription';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[ADMIN]: (user) => {
		return [{ subject, action: ['manage'], fields: [''] }];
	},

	[CUSTOMER]: (user) => {
		return [{ subject, action: ['view'], conditions: { isActive: true }, fields: [''] }];
	},
};

Casl.addAbilities(subject, abilities);
