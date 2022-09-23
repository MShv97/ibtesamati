const { httpStatus } = require('utils');
const AboutService = require('./service');

module.exports = {
	async update(req, res) {
		const { user, body: data } = req;
		const { id } = req.params;
		await new AboutService(data).update(user, id);
		res.sendStatus(httpStatus.UPDATED);
	},

	async get(req, res) {
		const { user } = req;
		const { id } = req.params;
		const result = await AboutService.get(user, id);
		res.status(httpStatus.OK).send(result);
	},
};
