/**
 * Base Repository class providing basic CRUD operations for MongoDB models.
 * @class BaseRepository
 * @template T - The type of the MongoDB model.
 * @param {T} model - The MongoDB model to perform CRUD operations on.
 */
class BaseRepository {
	constructor(model) {
		this.model = model;
	}

	/**
	 * Inserts a single document into the MongoDB collection.
	 *
	 * @method insertOne
	 * @async
	 * @param {Object} payload - The document to insert.
	 * @returns {Promise<Object>} The inserted document.
	 */
	async insertOne(payload) {
		return this.model.create(payload);
	}

	/**
	 * Inserts multiple documents into the MongoDB collection.
	 * @method insertMany
	 * @async
	 * @param {Array<Object>} payload - An array of documents to insert.
	 * @returns {Promise<Array<Object>>} The inserted documents.
	 */
	async insertMany(payload) {
		return this.model.insertMany(payload);
	}

	/**
	 * Finds a document in the MongoDB collection by its ID.
	 * @method findById
	 * @async
	 * @param {string} id - The ID of the document to find.
	 * @returns {Promise<Object>} The found document.
	 */
	async findById(id) {
		return this.model.findById(id).lean();
	}

	/**
	 * Finds a single document in the MongoDB collection matching the specified filter.
	 * @method findOne
	 * @async
	 * @param {Object} filter - The filter to apply to the search.
	 * @returns {Promise<Object>} The found document.
	 */

	async findOne(filter) {
		return this.model.findOne(filter).lean();
	}

	/**
	 * Finds multiple documents in the MongoDB collection matching the specified filter.
	 * @method findMany
	 * @async
	 * @param {Object} filter - The filter to apply to the search.
	 * @returns {Promise<Array<Object>>} An array of found documents.
	 */
	async findMany(filter) {
		return this.model.find(filter).lean();
	}

	/**
	 * Updates a document in the MongoDB collection by its ID.
	 * @method updateById
	 * @async
	 * @param {string} documentId - The ID of the document to update.
	 * @param {Object} setPayload - The update payload to apply to the document.
	 * @param {Object} [unsetPayload=null] - The payload of fields to unset from the document.
	 * @returns {Promise<Object>} The updated document.
	 */
	async updateById(documentId, setPayload, unsetPayload = null) {
		return this.model
			.updateById(
				documentId,
				{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } },
				{ new: true }
			)
			.lean();
	}

	/**
	 * Updates a single document in the MongoDB collection matching the specified filter.
	 * @method updateOne
	 * @async
	 * @param {Object} filter - The filter to apply to the search.
	 * @param {Object} setPayload - The update payload to apply to the document.
	 * @param {Object} [unsetPayload=null] - The payload of fields to unset from the document.
	 * @returns {Promise<Object>} The updated document.
	 */

	async updateOne(filter, setPayload, unsetPayload = null) {
		return this.model
			.updateOne(
				{ ...filter },
				{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } },
				{ new: true }
			)
			.lean();
	}

	/**
	 * Update a single document matching the provided filter in the database.
	 * @async
	 * @function updateOne
	 * @param {Object} filter - The filter criteria to find the document to update.
	 * @param {Object} setPayload - The document fields to update.
	 * @param {Object|null} [unsetPayload=null] - The document fields to unset.
	 * @returns {Promise<Object|null>} Returns a promise that resolves to the updated document or null if the filter does not match any documents.
	 */
	async updateMany(filter, setPayload, unsetPayload = null) {
		return this.model
			.updateMany(
				{ ...filter },
				{ $set: { ...setPayload, updatedAt: new Date() }, $unset: { ...unsetPayload } },
				{ new: true }
			)
			.lean();
	}

	/**
	 * Deletes a single document with the given id from the repository's model
	 *
	 * @param {string} documentId - The id of the document to be deleted
	 * @returns {Promise<Object>} A promise that resolves to the deleted document if found, otherwise resolves to null
	 */
	async deleteById(documentId) {
		return this.model.deleteOne({ _id: documentId });
	}

	/**
	 * Deletes a single document matching the given filter from the repository's model
	 *
	 * @param {Object} filter - The filter to be applied for finding the document to be deleted
	 * @returns {Promise<Object>} A promise that resolves to the deleted document if found, otherwise resolves to null
	 */
	async deleteOne(filter) {
		return this.model.deleteOne(filter);
	}

	/**
	 * Deletes all documents matching the given filter from the repository's model
	 *
	 * @param {Object} filter - The filter to be applied for finding the documents to be deleted
	 * @returns {Promise<Object>} A promise that resolves to the result of the delete operation
	 */

	async deleteMany(filter) {
		return this.model.deleteMany({ ...filter });
	}
}

module.exports = BaseRepository;
