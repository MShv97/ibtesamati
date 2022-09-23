const { httpStatus, getPagination } = require('utils');
const ProductService = require('./service');

module.exports = {
	async save(req, res) {
		const { user, body: data, files } = req;
		const result = await new ProductService(data, files).save(user);
		res.status(httpStatus.CREATED).json(result);
	},

	async update(req, res) {
		const { user, body: data } = req;
		const { id } = req.params;
		await new ProductService(data).update(user, id);
		res.sendStatus(httpStatus.UPDATED);
	},

	async uploadFiles(req, res) {
		const { user, body: data, files } = req;
		const { id } = req.params;
		await new ProductService(data, files).uploadFiles(user, id);
		res.sendStatus(httpStatus.CREATED);
	},

	async deleteFile(req, res) {
		const { user } = req;
		const { id, fileId } = req.params;
		await ProductService.deleteFile(user, id, fileId.toString());
		res.sendStatus(httpStatus.DELETED);
	},

	async delete(req, res) {
		const { user } = req;
		const { id } = req.params;
		await ProductService.delete(user, id);
		res.sendStatus(httpStatus.DELETED);
	},

	async getById(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await ProductService.getById(user, id);
		res.status(httpStatus.OK).send(result);
	},

	async getByCriteria(req, res) {
		const { user } = req;
		const { criteria, pagination } = getPagination(req.query);
		const result = await ProductService.getByCriteria(user, criteria, pagination);
		res.status(httpStatus.OK).send(result);
	},

	metadata(req, res) {
		const result = ProductService.metadata(req.query);
		res.status(httpStatus.OK).json(result);
	},
};
