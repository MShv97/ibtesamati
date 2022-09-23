const { Exception } = require('utils');
const { Order } = require('../Models');
const moment = require('moment');
const _ = require('lodash');

module.exports = {
	checkSubscription: (subscription) => {
		if (!subscription) return;
		const expiresAt = Order.calcSubscriptionExpiration(subscription.subscription, subscription.createdAt);
		if (moment().isSameOrAfter(expiresAt)) return;
		throw Exception.order.Active_Subscription;
	},

	prepareProducts: (subscription, products = []) => {
		let priceKey = 'fullPrice';
		if (subscription) {
			const expiresAt = Order.calcSubscriptionExpiration(subscription.subscription, subscription.createdAt);
			if (moment().isBefore(expiresAt)) priceKey = 'price';
		}

		return products.map((val) => ({ ...val, price: val[priceKey] || val.price }));
	},
};
