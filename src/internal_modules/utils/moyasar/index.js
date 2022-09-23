const { server, moyasar: moyasarConfig } = require('config-keys');
const { Exception } = require('../error-handlers');
const Moyasar = new (require('moyasar'))(moyasarConfig.secretKey);
const _ = require('lodash');

class MoyasarService {
	constructor() {}

	invoice = {
		create: async (order) => {
			const data = {
				amount: Math.round(order.totalPrice * 100),
				currency: order.currency || 'SAR',
				description: 'Basmati',
				callback_url: `${server.domain}/${moyasarConfig.callBackURL}`,
				metadata: { orderId: order._id.toString() },
			};

			const result = await Moyasar.invoice.create(data).catch(this.errorsHandler);
			return result;
		},
	};

	metadata() {
		return _.pick(moyasarConfig, ['publishableKey']);
	}

	errorsHandler(err) {
		console.log(err.error.errors);
		throw Exception.payment.Initiation_Failed;
	}
}

module.exports = new MoyasarService();
