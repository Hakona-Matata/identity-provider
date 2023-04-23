class BaseRepository {
	constructor(model) {
		this.model = model;
	}

	// Create Operations
	async insertOne(payload) {
		return await this.model.create(payload);
	}

	async insertMany(payload) {
		return await this.model.insertMany(payload);
	}

	// Read Operations
	async findById(id) {
		return await this.model.findById(id).lean();
	}

	async findOne(filter) {
		return await this.model.findOne(filter).lean();
	}

	async findMany(filter) {
		return await this.model.find(filter).lean();
	}

	// Update Operations
	async updateById(documentId, setPayload, unsetPayload) {
		return await this.model
			.findByIdAndUpdate(
				documentId,
				{ $set: { ...setPayload, updatedAt: new Date() }, $unset: unsetPayload },
				{ new: true }
			)
			.lean();
	}

	async updateOne(filter, setPayload, unsetPayload) {
		return await this.model
			.updateOne(filter, { $set: { ...setPayload, updatedAt: new Date() }, $unset: unsetPayload }, { new: true })
			.lean();
	}

	async updateMany(filter, setPayload, unsetPayload) {
		return await this.model
			.updateMany(filter, { $set: { ...setPayload, updatedAt: new Date() }, $unset: unsetPayload }, { new: true })
			.lean();
	}

	// Delete Operations
	async deleteById(documentId) {
		return await this.model.findByIdAndDelete(documentId).lean();
	}

	async deleteOne(filter) {
		return await this.model.findOneAndDelete(filter).lean();
	}

	async deleteMany(filter) {
		return await this.model.deleteMany(filter).lean();
	}
}

module.exports = BaseRepository;
