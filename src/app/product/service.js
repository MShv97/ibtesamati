const { Exception, FileService } = require('utils');
const { Product, File } = require('../Models');
const mongoose = require('mongoose');
const _ = require('lodash');

class ProductService {
	constructor(data, files) {
		this.name = data.name;
		this.description = data.description;
		this.fullPrice = data.fullPrice;
		this.price = data.price;
		this.isActive = data.isActive;
		this.isSpecial = data.isSpecial;
		this.warranty = data.warranty;
		this.images = files?.images?.map((val) => new FileService(val).create());
		this.images = this.images || data.images;
	}

	async save(user) {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			[result] = await Promise.all([new Product(this).save({ session }), File.insertMany(this.images || [], { session })]);
		});
		return { data: { id: result._id } };
	}

	async update(user, _id) {
		const session = await Product.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id, ...Product.accessibleBy(user.abilities, 'update').getQuery() };
			const result = await Product.findOneAndUpdate(conditions, this, { projection: 'images', lean: true, session });
			if (!result) throw Exception.product.Not_Found;
			if (!this.images) return;
			const same = result.images.every((val) => this.images?.includes(val.toString()));
			if (this.images.length !== result.images.length && !same) throw Exception.product.Images_Sort_Conflict;
		});
	}

	async uploadFiles(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const [result] = await Promise.all([
				Product.accessibleBy(user.abilities, 'update').findOneAndUpdate(
					{ _id },
					{ $push: { images: this.images } },
					{ projection: 'images', lean: true, session }
				),
				File.insertMany(this.images, { session }),
			]);
			if (!result) throw Exception.product.Not_Found;
			if (result.images.length + this.images.length > 4)
				throw Exception.validation.Validation_Error(['files.images must contain less than or equal to 4 items']);
		});
	}

	static async deleteFile(user, _id, fileId) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const conditions = { _id, ...Product.accessibleBy(user.abilities, 'update').getQuery() };
			const result = await Product.findOne(conditions, 'images', { session });
			if (!result) throw Exception.product.Not_Found;

			if (result.images.some((val) => val.toString() === fileId))
				result.images = result.images.filter((val) => val.toString() !== fileId);
			else throw Exception.file.Not_Found;

			await Promise.all([result.save({ session }), FileService.delete(fileId, session)]);
		});
	}

	static async delete(user, _id) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const result = await Product.accessibleBy(user.abilities, 'delete').findOneAndDelete(
				{ _id },
				{ projection: 'images', lean: true, session }
			);
			if (!result) throw Exception.product.Not_Found;
			await FileService.deleteArray(result.images, session);
		});
	}

	static async getById(user, _id) {
		const projection = Product.accessibleFieldsBy(user.abilities, 'view');
		const result = await Product.accessibleBy(user.abilities, 'view').findOne({ _id }, projection);
		if (!result) throw Exception.product.Not_Found;
		return { data: result };
	}

	static async getByCriteria(user, criteria, pagination) {
		const conditions = (() => {
			const result = {
				...criteria,
				...Product.accessibleBy(user.abilities, 'view').getQuery(),
			};

			['name'].forEach((key) => {
				if (criteria[key]) result[key] = new RegExp(`${criteria[key]}`, 'i');
			});

			return result;
		})();

		const projection = Product.accessibleFieldsBy(user.abilities, 'view');
		projection.push('-createdAt', '-updatedAt');
		const result = await Product.findAndCount({ conditions, projection, pagination });
		result.data = result.data.map((val) => {
			val = val.toObject();
			val.image = val.images[0];
			delete val.images;
			return val;
		});

		return result;
	}

	static metadata({ keys }) {
		return { data: Product.metadata(keys) };
	}
}

module.exports = ProductService;
