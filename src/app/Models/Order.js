const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { defaultOptions } = require('database').utils;
const { Statuses } = require('./embedded');
const { Subscription, Product, priceType } = require('./embedded').OrderSchemas;
const moment = require('moment');

const Order = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		type: { type: String, default: 'Online', required: true },
		statuses: { type: [Statuses], default: { status: 'Pending payment' } },
		discount: { type: Number, default: 0, required: true },
		invoice: { type: String },
		subTotal: priceType(),
		totalPrice: priceType(),
		subscription: Subscription,
		products: { type: [Product], default: undefined, get: (val) => (val?.length ? val : undefined) },
	},
	defaultOptions({ timestamps: true, hide: ['subscription.duration'] })
);

function calcSubscriptionExpiration(subscription, date) {
	if (!subscription || !date) return;
	return moment(date).add(subscription.duration.value, subscription.duration.unit).toDate();
}
Order.virtual('subscription.expiresAt').get(function () {
	if (!this.subscription?.duration) return;
	const date = this.status?.at || this.statuses?.at(-1)?.at;
	return calcSubscriptionExpiration(this.subscription, date);
});

Order.statics = {
	calcSubscriptionExpiration,

	TYPES: { CASH: 'Cash', ONLINE: 'Online' },
	STATUSES: {
		// Payment related statuses
		PENDING_PAYMENT: 'Pending payment',
		PAYMENT_CANCELED: 'Payment canceled',
		PAYMENT_FAILED: 'Payment failed',

		// processing statuses
		PENDING: 'Pending',
		ACCEPTED: 'Accepted',

		// end statuses
		DROPPED: 'Dropped',
		REJECTED: 'Rejected',
		AUTO_REJECTED: 'Auto rejected',
		CANCELED: 'Canceled',
		DONE: 'Done',
	},
};

module.exports = mongoose.model('Order', Order, 'Order');
