const { Casl } = require('utils');
const { SYSTEM, ADMIN, CUSTOMER } = require('../Models').User.TYPES;

const subject = 'Order';

const abilities = {
	[SYSTEM]: (user) => {
		return [{ subject, action: ['manage'], fields: ['-user'] }];
	},

	[ADMIN]: (user) => {
		return [{ subject, action: ['manage'], fields: ['-user'] }];
	},

	[CUSTOMER]: (user) => {
		return [{ subject, action: ['save', 'calculate', 'view', 'cancel'], conditions: { user: user.id }, fields: ['-user'] }];
	},

	undefined: (user) => {
		return [{ subject, action: ['calculate'], fields: ['-user'] }];
	},
};

Casl.addAbilities(subject, abilities);
