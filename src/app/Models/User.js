const { rounds } = require('config-keys').bcrypt;
const { defaultOptions } = require('database').utils;
const { IsVerified } = require('./embedded');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TYPES = { SYSTEM: 'System', ADMIN: 'Admin', CUSTOMER: 'Customer' };

const User = new Schema(
	{
		// personal details
		type: { type: String, enum: TYPES, default: TYPES.CUSTOMER, required: true },
		fullName: { type: String, required: true },
		phone: { type: String, unique: true, sparse: true, required: true },
		email: { type: String, unique: true, sparse: true },
		password: { type: String, trim: true, select: false, set: (val) => (val ? bcrypt.hashSync(val, rounds) : val) },
		avatar: { type: Schema.Types.ObjectId, ref: 'File' },

		// system
		isActive: { type: Boolean, default: true },
		isVerified: { type: IsVerified, default: {} },
		lastLogin: { type: Date, default: () => new Date() },
	},
	defaultOptions({ timestamps: true })
);

User.statics = {
	TYPES,

	logIn: function (filters) {
		return this.findOne(filters, 'type password isVerified');
	},

	auth: async function (filters) {
		const result = await this.findOne(filters, 'type isVerified isActive lastLog');
		return result?.toObject();
	},

	isVerified: function (user) {
		return true;
		if ([TYPES.SYSTEM, TYPES.ADMIN].includes(user.type)) return true;
		return user.isVerified?.phone || false;
	},
};

User.methods.verifyPassword = function (password) {
	if (!password || !this.password) return false;
	return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', User, 'User');
