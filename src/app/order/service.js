const { Exception, Moyasar } = require('utils');
const { Order, Product, Subscription, User } = require('../Models');
const { getNextStatus, checkStatusConditions, prepareProducts, checkSubscription } = require('./utils');
const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('lodash');

class OrderService {
	constructor(data) {
		this.user = data.user;
		this.type = data.type;
		this.products = data.products;
		this.subscription = data.subscription;

		this.discount = data.discount || 0;
		this.subTotal = 0;

		if (data.type === Order.TYPES.CASH) this.statuses = [{ status: Order.STATUSES.PENDING }, { status: Order.STATUSES.DONE }];
	}

	async validate(user, session) {
		let subscription;
		[this.user, [subscription], this.products, this.subscription] = await Promise.all([
			(async () => {
				if (!this.user) return user.id;
				const conditions = { _id: this.user, ...User.accessibleBy(user.abilities, 'order').getQuery() };
				const foundUser = await User.findOne(conditions, 'type', { lean: true, session });
				if (!foundUser) throw Exception.user.Not_Found;
				return this.user;
			})(),
			Order.aggregate([
				{
					$match: {
						user: this.user || user.id,
						subscription: { $exists: true },
						$expr: { $eq: [{ $last: '$statuses.status' }, Order.STATUSES.DONE] },
					},
				},
				{ $project: { subscription: 1, createdAt: { $last: '$statuses.at' } } },
				{ $sort: { createdAt: -1 } },
				{ $limit: 1 },
			]).session(session),
			(async () => {
				if (!this.products?.length) return [];
				const conditions = {
					_id: this.products.map((val) => val.id),
					...Product.accessibleBy(user.abilities, 'order').getQuery(),
				};
				const products = await Product.find(conditions, 'name warranty fullPrice price', { lean: true, session });
				if (products.length !== this.products.length)
					throw Exception.order.Product_Not_Available(this.products, products);
				const qtyById = this.products.reduce((acc, cur) => (acc[cur.id] = cur.qty) && acc, {});
				return products.map((val) => ({ ...val, qty: qtyById[val._id] }));
			})(),
			(async () => {
				if (!this.subscription) return;
				const conditions = {
					_id: this.subscription,
					...Subscription.accessibleBy(user.abilities, 'order').getQuery(),
				};
				const subscription = await Subscription.findOne(conditions, 'name price duration', { lean: true, session });
				if (!subscription) throw Exception.subscription.Not_Found;
				return subscription;
			})(),
		]);

		if (this.subscription) {
			checkSubscription(subscription);
			this.subTotal += this.subscription.price;
		}
		this.products = prepareProducts(subscription, this.products);
		this.subTotal += this.products?.reduce((acc, cur) => (acc += cur.price * cur.qty) && acc, 0) || 0;
		this.totalPrice = this.subTotal - this.subTotal * this.discount;
	}

	async save(user) {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			await this.validate(user, session);
			result = new Order(this);

			if (result.type === Order.TYPES.ONLINE) {
				const invoice = await Moyasar.invoice.create(result);
				result.invoice = invoice.url;
			}

			result = await result.save({ session });
		});
		return { data: { id: result.id } };
	}

	async calculate(user) {
		await this.validate(user);
		const projection = Order.accessibleFieldsBy(user.abilities, 'calculate').map((val) => val.split('-')[1]);
		const result = _.omit(new Order(this).toObject(), ['id', 'statuses', ...projection]);
		return { data: result };
	}

	static async getById(user, _id) {
		const projection = Order.accessibleFieldsBy(user.abilities, 'view');
		let result = await Order.accessibleBy(user.abilities, 'view').findOne({ _id }, projection);
		if (!result) throw Exception.order.Not_Found;
		result = result.toObject();

		result.products = result.products?.map(({ warranty, ...val }) => {
			if (!warranty) return val;
			return {
				...val,
				warrantyExpiresAt: moment(result.statuses.at(-1).at).add(warranty.value, warranty.unit),
			};
		});

		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				..._.omit(criteria, ['status', 'isSubscription']),
				...Order.accessibleBy(user.abilities, 'view').getQuery(),
			};

			if (criteria.isSubscription !== undefined) result['subscription'] = { $exists: criteria.isSubscription };
			if (criteria.status) result['$expr'] = { $in: [{ $last: '$statuses.status' }, criteria.status] };

			return result;
		})();

		const projection = _.omit(
			{
				user: 1,
				totalPrice: 1,
				payment: 1,
				createdAt: 1,
				subscription: 1,
				productsCount: { $size: { $ifNull: ['$products', []] } },
				status: { $last: '$statuses' },
			},
			Order.accessibleFieldsBy(user.abilities, 'view').map((val) => val.split('-')[1])
		);

		const [result, totalPayments] = await Promise.all([
			// Payment.getTotal(Payment.RESOURCE_TYPES.BOOKING, bookingIds),
			Order.findAndCount({ conditions, pagination, projection }),
		]);
		result.data = result.data.map((val) => {
			val = val.toObject();
			if (val.subscription) delete val.productsCount;
			return val;
		});

		return { totalPayments, ...result };
	}

	/************************************
	 * 									*
	 *			EVENTS HANDLERS			*
	 *     								*
	 ************************************/

	static async onPaymentHold(payment) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const order = await Order.findOne({ _id: payment.resource }, 'products', {
				lean: true,
				session,
				populate: { path: 'products', select: 'isActive' },
			});
			if (!order) return;
			if (!order.products.every((val) => val.isActive)) {
				const reason = 'One or more product are no longer available.';
				return Promise.all([
					Order.updateOne(
						{ _id: payment.resource },
						{ $push: { statuses: { status: Order.STATUSES.CANCELED, reason } } },
						{ session }
					),
					PaymentService.cancel(payment._id, { reason }, session),
				]);
			}
		});

		return Promise.all([
			Order.updateOne({ _id: payment.resource }, { $push: { statuses: { status: Order.STATUSES.PENDING } } }, { session }),
			mongoose
				.model(booking.resourceType)
				.updateOne(
					{ _id: booking.resource },
					{ $inc: { totalPayments: payment.amount, tickets: booking.tickets } },
					{ session, strict: false }
				),
			PaymentService.capture(payment._id, session),
		]);
	}

	static async onPaymentSuccess(payment, session) {
		return Order.updateOne(
			{ _id: payment.resource },
			{ $push: { statuses: { status: Order.STATUSES.ACCEPTED } } },
			{ session }
		);
	}

	static async onPaymentCancel(payment, reason, session) {
		const booking = await Order.findOne({ _id: payment.resource }, 'resource resourceType statuses tickets', {
			lean: true,
			session,
		});
		if (!booking) return;
		if (booking.statuses.some((val) => val.status === Order.STATUSES.CANCELED)) return;
		const queries = [
			Order.updateOne({ _id }, { $push: { statuses: { status: Order.STATUSES.PAYMENT_CANCELED, reason } } }, { session }),
		];

		if (booking.statuses.some((val) => val.status === Order.STATUSES.PENDING)) {
			queries.push(
				mongoose.model(booking.resourceType).updateOne(
					//
					{ _id: booking.resource },
					{ $inc: { totalPayments: -payment.amount, tickets: -booking.tickets } },
					{ session, strict: false }
				)
			);
		}

		return Promise.all(queries);
	}

	static async onPaymentFailure(payment, reason, session) {
		const booking = await Order.findOneAndUpdate(
			{ _id: payment.resource },
			{ $push: { statuses: { status: Order.STATUSES.PAYMENT_FAILED, reason } } },
			{ lean: true, session, projection: 'resource resourceType statuses tickets' }
		);
		if (!booking) return;
		if (booking.statuses.some((val) => val.status === Order.STATUSES.PENDING))
			await mongoose
				.model(booking.resourceType)
				.updateOne(
					{ _id: booking.resource },
					{ $inc: { totalPayments: -payment.amount, tickets: -booking.tickets } },
					{ session }
				);
	}

	static async onPaymentRefunded(payment, session) {
		const booking = await Order.findOne({ _id: payment.resource }, 'resource resourceType statuses tickets', {
			lean: true,
			session,
		});
		if (!booking) return;
		if (booking.statuses.some((val) => val.status === Order.STATUSES.CANCELED)) return;

		const reason = 'Payment refunded.';
		return Promise.all([
			Order.updateOne({ _id }, { $push: { statuses: { status: Order.STATUSES.CANCELED, reason } } }, { session }),
			mongoose
				.model(booking.resourceType)
				.updateOne(
					{ _id: booking.resource },
					{ $inc: { totalPayments: -payment.amount, tickets: -booking.tickets } },
					{ session, strict: false }
				),
		]);
	}

	static async job() {
		const orders = await Order.find(
			{
				createdAt: { $lt: moment().subtract(10, 'minutes') },
				$expr: { $eq: [{ $arrayElemAt: ['$statuses.status', -1] }, Order.STATUSES.PENDING] },
			},
			'payment',
			{ populate: { path: 'payment', select: 'method stripe' }, lean: true }
		);
		if (!orders.length) return;
		const orderIds = orders.map((val) => val._id);
		const reason = 'Restaurant is busy.';
		const data = { $push: { statuses: { status: Order.STATUSES.AUTO_REJECTED, reason } } };
		const payments = orders.map((val) => val.payment);
		await Promise.all([Order.updateMany({ _id: orderIds }, data), PaymentService.bulkCancel(payments, reason)]);
		console.log(`${orders.length} orders auto rejected by order job.`);
	}

	static metadata({ keys }) {
		return { data: Order.metadata(keys) };
	}
}

module.exports = OrderService;
