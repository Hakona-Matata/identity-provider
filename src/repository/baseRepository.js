class BaseRepository {
	constructor(model) {
		this.model = model;
	}

	// Create Operations
	async insertOne(payload) {
		return this.model.create(payload);
	}

	async insertMany(payload) {
		return this.model.insertMany(payload);
	}

	// Read Operations
	async findById(id) {
		return this.model.findById(id).lean();
	}

	async findOne(filter) {
		return this.model.findOne(filter).lean();
	}

	async findMany(filter) {
		return this.model.find(filter).lean();
	}

	// Update Operations
	async updateById(documentId, setPayload, unsetPayload = null) {
		return this.model
			.updateById(
				documentId,
				{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } },
				{ new: true }
			)
			.lean();
	}

	async updateOne(filter, setPayload, unsetPayload = null) {
		return this.model
			.updateOne(
				{ ...filter },
				{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } },
				{ new: true }
			)
			.lean();
	}

	async updateMany(filter, setPayload, unsetPayload = null) {
		return this.model
			.updateMany(
				{ ...filter },
				{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } },
				{ new: true }
			)
			.lean();
	}

	// Delete Operations
	async deleteById(documentId) {
		return this.model.findByIdAndDelete(documentId).lean();
	}

	async deleteOne(filter) {
		return this.model.findOneAndDelete(filter).lean();
	}

	async deleteMany(filter) {
		return this.model.deleteMany(filter).lean();
	}
}

module.exports = BaseRepository;
