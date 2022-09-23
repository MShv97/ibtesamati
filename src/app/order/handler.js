const { httpStatus, getPagination } = require('utils');
const OrderService = require('./service');

module.exports = {
	async save(req, res) {
		const { user, body: data } = req;
		const result = await new OrderService(data).save(user);
		res.status(httpStatus.CREATED).json(result);
	},

	async calculate(req, res) {
		const { user, body: data } = req;
		const result = await new OrderService(data).calculate(user);
		res.status(httpStatus.CREATED).json(result);
	},

	async webhook(req, res) {
		console.log(req.body);
		res.sendStatus(httpStatus.OK);
	},

	async getById(req, res) {
		const { id } = req.params;
		const { user } = req;
		const result = await OrderService.getById(user, id);
		res.status(httpStatus.OK).json(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await OrderService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).json(result);
	},

	metadata(req, res) {
		const result = OrderService.metadata(req.query);
		res.status(httpStatus.OK).json(result);
	},
};
