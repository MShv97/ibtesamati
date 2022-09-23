const { httpStatus, getPagination } = require('utils');
const SubscriptionService = require('./service');

module.exports = {
	async save(req, res) {
		const { user, body: data, files } = req;
		const result = await new SubscriptionService(data, files).save(user);
		res.status(httpStatus.CREATED).json(result);
	},

	async update(req, res) {
		const { user, body: data } = req;
		const { id } = req.params;
		await new SubscriptionService(data).update(user, id);
		res.sendStatus(httpStatus.UPDATED);
	},

	async delete(req, res) {
		const { user } = req;
		const { id } = req.params;
		await SubscriptionService.delete(user, id);
		res.sendStatus(httpStatus.DELETED);
	},

	async getById(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await SubscriptionService.getById(user, id);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await SubscriptionService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	metadata(req, res) {
		const result = SubscriptionService.metadata(req.query);
		res.status(httpStatus.OK).json(result);
	},
};
