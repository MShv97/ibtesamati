const { httpStatus, getPagination } = require('utils');
const UserService = require('./service');

module.exports = {
	async save(req, res) {
		const { user, body: data, files } = req;
		const result = await new UserService(data, files).save(user);
		res.status(httpStatus.CREATED).json(result);
	},

	activate: (active) => async (req, res) => {
		const { user } = req;
		const { id } = req.params;
		await UserService.activate(user, id, active);
		res.sendStatus(httpStatus.OK);
	},

	async update(req, res) {
		const { user, body: data, files } = req;
		const { id } = req.params;
		await new UserService(data, files).update(user, id);
		res.sendStatus(httpStatus.UPDATED);
	},

	async updateMine(req, res) {
		const { user, body: data, files } = req;
		await new UserService(data, files).updateMine(user);
		res.sendStatus(httpStatus.UPDATED);
	},

	async changePassword(req, res) {
		const { user, body: data } = req;
		await UserService.changePassword(user, data);
		res.sendStatus(httpStatus.UPDATED);
	},

	async deleteFile(req, res) {
		const { user } = req;
		const { id, fileId } = req.params;
		await UserService.deleteFile(user, id, fileId.toString());
		res.sendStatus(httpStatus.DELETED);
	},

	async delete(req, res) {
		const { user } = req;
		const { id } = req.params;
		await UserService.delete(user, id);
		res.sendStatus(httpStatus.DELETED);
	},

	async getMine(req, res) {
		const { user } = req;
		const result = await UserService.getMine(user);
		res.status(httpStatus.OK).send(result);
	},

	async getById(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await UserService.getById(user, id);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await UserService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	metadata(req, res) {
		const result = UserService.metadata(req.query);
		res.status(httpStatus.OK).json(result);
	},
};
