const { Exception } = require('utils');
const { About } = require('../Models');

class AboutService {
	constructor(data) {
		this.description = data.description;
		this.facebook = data.facebook;
		this.instagram = data.instagram;
		this.snapchat = data.snapchat;
		this.linkedIn = data.linkedIn;
		this.whatsApp = data.whatsApp;
		this.phones = data.phones;
		this.mobiles = data.mobiles;
	}

	async update(user, _id) {
		const result = await About.updateOne({}, this);
		if (!result.matchedCount) throw Exception.about.Not_Found;
	}

	static async get(user, _id) {
		const result = await About.findOne();
		if (!result) throw Exception.about.Not_Found;
		return { data: result };
	}
}

module.exports = AboutService;
