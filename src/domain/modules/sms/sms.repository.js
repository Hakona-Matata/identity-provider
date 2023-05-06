/**
 * Repository for OTP over SMS.
 * @class
 * @property {Function} insertOne - Inserts a new OTP over SMS document to the database.
 * @property {Function} findOne - Retrieves a single OTP over SMS document from the database.
 * @property {Function} updateOne - Updates an OTP over SMS document in the database.
 * @property {Function} deleteOne - Deletes an OTP over SMS document from the database.
 */
const SmsModel = require("./../otp/otp.model");

const { BaseRepository } = require("./../../repository/index");

class SmsRepository extends BaseRepository {
	constructor() {
		super(SmsModel);
	}

	/**
	 * Inserts a new OTP over SMS document to the database.
	 * @param {object} payload - Payload for creating a new document.
	 * @returns {object} - Newly created OTP over SMS document.
	 */
	async insertOne(payload) {
		return await super.insertOne({ ...payload, sendingMethod: "SMS" });
	}

	/**
	 * Retrieves a single OTP over SMS document from the database.
	 * @param {object} payload - Payload for finding a document.
	 * @returns {object} - Retrieved OTP over SMS document.
	 */
	async findOne(payload) {
		return await super.findOne({ ...payload, sendingMethod: "SMS" });
	}

	/**
	 * Updates an OTP over SMS document in the database.
	 * @param {object} filter - Filter for finding the document to update.
	 * @param {object} setPayload - Payload to set for the update.
	 * @param {object} unsetPayload - Payload to unset for the update.
	 * @returns {object} - Result of the update operation.
	 */
	async updateOne(filter, setPayload, unsetPayload) {
		return await super.updateOne({ ...filter, sendingMethod: "SMS" }, setPayload, unsetPayload);
	}

	/**
	 * Deletes an OTP over SMS document from the database.
	 * @param {object} filter - Filter for finding the document to delete.
	 * @returns {object} - Result of the delete operation.
	 */
	async deleteOne(filter) {
		return await super.deleteOne({ ...filter, sendingMethod: "SMS" });
	}
}

module.exports = new SmsRepository();
