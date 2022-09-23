const { Casl } = require('utils');
const { SYSTEM, ADMIN, CUSTOMER } = require('../Models').User.TYPES;

const subject = 'User';

const abilities = {
	[SYSTEM]: (user) => {
		return [
			{
				subject,
				action: ['save', 'update', 'delete', 'activate', 'view'],
				conditions: { _id: { $ne: user.id }, type: { $ne: SYSTEM } },
				fields: [''],
			},
			{ subject, action: ['view-mine', 'update-mine', 'password'], conditions: { _id: user.id }, fields: [''] },
			{ subject, action: ['order'], conditions: { type: CUSTOMER, isActive: true } },
		];
	},

	[ADMIN]: (user) => {
		return [
			{
				subject,
				action: ['save', 'update', 'delete', 'activate'],
				conditions: { _id: { $ne: user.id }, type: CUSTOMER },
				fields: [''],
			},
			{ subject, action: ['view'], conditions: { type: { $ne: SYSTEM } }, fields: [''] },
			{ subject, action: ['view-mine', 'update-mine', 'password'], conditions: { _id: user.id }, fields: [''] },
			{ subject, action: ['order'], conditions: { type: CUSTOMER, isActive: true } },
		];
	},

	[CUSTOMER]: (user) => {
		return [{ subject, action: ['password', 'view-mine', 'update-mine'], conditions: { _id: user.id }, fields: [''] }];
	},

	undefined: (user) => {
		return [{ subject, action: ['view-mine'] }];
	},
};

Casl.addAbilities(subject, abilities);
