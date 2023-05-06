/**
 * OtpRepository provides functions to perform CRUD operations on the otp collection in the database.
 * @class
 * @extends BaseRepository
 */
const OtpModel = require("./otp.model");

const { BaseRepository } = require("./../../repository/index");

class OtpRepository extends BaseRepository {
	constructor() {
		super(OtpModel);
	}

	/**
	 * Inserts a new otp document into the database.
	 * @param {Object} payload - The otp document to insert.
	 * @returns {Promise<Object>} - The newly inserted otp document.
	 */
	async insertOne(payload) {
		return await super.insertOne({ ...payload, sendingMethod: "EMAIL" });
	}

	/**
	 * Finds an otp document in the database that matches the given payload.
	 * @param {Object} payload - The payload to match against.
	 * @returns {Promise<Object>} - The matching otp document, or null if no match is found.
	 */
	async findOne(payload) {
		return await super.findOne({ ...payload, sendingMethod: "EMAIL" });
	}

	/**
	 * Updates an otp document in the database that matches the given filter.
	 * @param {Object} filter - The filter to match against.
	 * @param {Object} setPayload - The payload to set.
	 * @param {Object} unsetPayload - The payload to unset.
	 * @returns {Promise<Object>} - The updated otp document.
	 */
	async updateOne(filter, setPayload, unsetPayload) {
		return await super.updateOne({ ...filter, sendingMethod: "EMAIL" }, setPayload, unsetPayload);
	}

	/**
	 * Deletes an otp document in the database that matches the given filter.
	 * @param {Object} filter - The filter to match against.
	 * @returns {Promise<Object>} - The deleted otp document.
	 */
	async deleteOne(filter) {
		return await super.deleteOne({ ...filter, sendingMethod: "EMAIL" });
	}
}

module.exports = new OtpRepository();
