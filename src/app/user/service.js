const { convertToDotNotation } = require('database').utils;
const { Exception, FileService, Casl } = require('utils');
const { parseSubscription } = require('./utils');
const { User, Order } = require('../Models');
const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('lodash');

class UserService {
	constructor(data, files) {
		// personal details
		this.type = data.type;
		this.fullName = data.fullName;
		this.email = data.email;
		this.phone = data.phone;
		this.password = data.password;
		if (data.email) this['isVerified.email'] = false;
		if (data.phone) this['isVerified.phone'] = false;
		this.avatar = new FileService(files?.avatar?.at(0)).create();
	}

	async save(user) {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			result = await this.create(user, session);
		});
		return { data: { id: result._id } };
	}

	async create(user, session) {
		const [result] = await Promise.all([new User(this).save({ session }), this.avatar?.save({ session })]);
		return result;
	}

	static async activate(user, _id, isActive) {
		const conditions = { _id, ...User.accessibleBy(user.abilities, 'activate').getQuery() };
		const result = await User.updateOne(conditions, { isActive });
		if (!result.matchedCount) throw Exception.user.Not_Found;
	}

	async update(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const data = convertToDotNotation(this, { ignore: ['avatar', 'files'] });
			const [result] = await Promise.all([
				User.accessibleBy(user.abilities, 'update').findOneAndUpdate({ _id }, data, {
					projection: 'avatar',
					lean: true,
					session,
				}),
				this.avatar?.save({ session }),
			]);
			if (!result) throw Exception.user.Not_Found;
			if (this.avatar && result.avatar) await FileService.delete(result.avatar, session);
		});
	}

	async updateMine(user) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const data = convertToDotNotation(this, { ignore: ['avatar', 'files'] });
			const [result] = await Promise.all([
				User.accessibleBy(user.abilities, 'update-mine').findOneAndUpdate({ _id: user.id }, data, {
					projection: 'avatar',
					lean: true,
					session,
				}),
				this.avatar?.save({ session }),
			]);
			if (!result) throw Exception.user.Not_Found;
			if (this.avatar && result.avatar) await FileService.delete(result.avatar, session);
		});
	}

	static async delete(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const [result] = await Promise.all([
				User.accessibleBy(user.abilities, 'delete').findOneAndDelete(
					{ _id },
					{ projection: 'avatar', lean: true, session }
				),
				//TODO: delete related
			]);
			if (!result) throw Exception.user.Not_Found;
			await FileService.delete(result.avatar, session);
		});
	}

	static async changePassword(user, data) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const result = await User.accessibleBy(user.abilities, 'password').findOneAndUpdate(
				{ _id: user.id },
				{ password: data.new },
				{ projection: 'password', session }
			);
			if (!result) throw Exception.user.Not_Found;
			const matched = await result.verifyPassword(data.old);
			if (!matched) throw Exception.auth.Invalid_Old_Password;
		});
	}

	static async deleteFile(user, _id, fileId) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id, ...User.accessibleBy(user.abilities, 'update').getQuery() };
			const result = await User.findOne(conditions, 'avatar', { session });
			if (!result) throw Exception.user.Not_Found;

			if (result.avatar?.toString() === fileId) result.avatar = undefined;
			else throw Exception.file.Not_Found;

			await Promise.all([result.save({ session }), FileService.delete(fileId, session)]);
		});
	}

	static async getMine(user) {
		if (!user.id) return { data: { abilities: Casl.buildFrontEndAbilities(user) } };
		let result = await User.findOne({ _id: user.id });
		if (!result) throw Exception.user.Not_Found;
		result = result.toObject();

		if (result.type === User.TYPES.CUSTOMER) {
			const [subscription] = await Order.aggregate([
				{
					$match: {
						user: user.id,
						subscription: { $exists: true },
						$expr: { $eq: [{ $last: '$statuses.status' }, Order.STATUSES.DONE] },
					},
				},
				{ $project: { subscription: 1, createdAt: { $last: '$statuses.at' } } },
				{ $sort: { createdAt: -1 } },
				{ $limit: 1 },
			]);
			result.subscription = parseSubscription(subscription);
		}

		result.abilities = Casl.buildFrontEndAbilities(result);

		return { data: result };
	}

	static async getById(user, _id) {
		const projection = User.accessibleFieldsBy(user.abilities, 'view');
		const result = await User.accessibleBy(user.abilities, 'view').findOne({ _id }, projection);
		if (!result) throw Exception.user.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				...criteria,
				...User.accessibleBy(user.abilities, 'view').getQuery(),
			};

			['type'].forEach((key) => {
				if (criteria[key]) result[key] = { $in: criteria[key] };
			});
			['fullName', 'email', 'phone'].forEach((key) => {
				if (criteria[key]) result[key] = new RegExp(`${criteria[key]}`, 'i');
			});

			return result;
		})();

		const projection = User.attributes([
			...User.accessibleFieldsBy(user.abilities, 'view').map((val) => val.split('-')[1]),
			'avatar',
			'lastLogin',
			'createdAt',
			'updatedAt',
		]);
		const pipeline = {
			stage1: [{ $match: conditions }],
			stage2: [
				{
					$lookup: {
						from: 'Order',
						localField: '_id',
						foreignField: 'user',
						as: 'subscription',
						pipeline: [
							{
								$match: {
									subscription: { $exists: true },
									$expr: { $eq: [{ $last: '$statuses.status' }, Order.STATUSES.DONE] },
								},
							},
							{ $project: { subscription: 1, createdAt: { $last: '$statuses.at' } } },
							{ $sort: { createdAt: -1 } },
							{ $limit: 1 },
						],
					},
				},
				{ $project: { ...projection, subscription: 1 } },
			],
		};

		const result = await User.aggregateAndCount(pipeline.stage1, pagination, pipeline.stage2);
		result.data = result.data?.map((val) => ({ ...val, subscription: parseSubscription(val.subscription[0]) }));

		return result;
	}

	static metadata({ keys }) {
		return { data: User.metadata(keys) };
	}
}

module.exports = UserService;
