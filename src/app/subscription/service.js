const { Exception } = require('utils');
const { Subscription } = require('../Models');
const { priceFilter } = require('./utils');
const mongoose = require('mongoose');
const _ = require('lodash');

class SubscriptionService {
	constructor(data) {
		this.name = data.name;
		this.description = data.description;
		this.price = data.price;
		this.discount = data.discount;
		this.isActive = data.isActive;
		this.duration = data.duration;
	}

	async save(user) {
		const result = await new Subscription(this).save({ session });
		return { data: { id: result._id } };
	}

	async update(user, _id) {
		const conditions = { _id, ...Subscription.accessibleBy(user.abilities, 'update').getQuery() };
		const result = await Subscription.updateOne(conditions, this);
		if (!result.matchedCount) throw Exception.subscription.Not_Found;
	}

	static async delete(user, _id) {
		const result = await Subscription.accessibleBy(user.abilities, 'delete').deleteOne({ _id });
		if (!result.deletedCount) throw Exception.subscription.Not_Found;
	}

	static async getById(user, _id) {
		const projection = Subscription.accessibleFieldsBy(user.abilities, 'view');
		const result = await Subscription.accessibleBy(user.abilities, 'view').findOne({ _id }, projection);
		if (!result) throw Exception.subscription.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				...criteria,
				...Subscription.accessibleBy(user.abilities, 'view').getQuery(),
			};
			priceFilter(result);
			['name'].forEach((key) => {
				if (criteria[key]) result[key] = new RegExp(`${criteria[key]}`, 'i');
			});

			return result;
		})();

		const projection = Subscription.accessibleFieldsBy(user.abilities, 'view');
		projection.push('-createdAt', '-updatedAt');
		const result = await Subscription.findAndCount({ conditions, projection, pagination });

		return result;
	}

	static metadata({ keys }) {
		return { data: Subscription.metadata(keys) };
	}
}

module.exports = SubscriptionService;
