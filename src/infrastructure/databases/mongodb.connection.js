const mongoose = require("mongoose");
const config = require("./../config/environments");

/**
 * The configuration for connecting to a MongoDB database.
 *
 * @class
 */
class MongoConnection {
	/**
	 * Connects to a MongoDB database using the MONGO_URI environment variable.
	 *
	 * @returns {Promise<void>} A promise that resolves when the connection is successful.
	 */
	static async connect() {
		mongoose.set("strictQuery", false);
		return mongoose.connect(config.db.baseUrl, {
			connectTimeoutMS: 30000,
		});
	}

	/**
	 * Drops the currently connected database.
	 *
	 * @returns {Promise<void>} A promise that resolves when the database is dropped.
	 */
	static async dropDataBase() {
		return mongoose.connection.dropDatabase();
	}

	/**
	 * Drops a specified collection from the currently connected database.
	 *
	 * @param {string} collectionName - The name of the collection to drop.
	 * @returns {Promise<void>} A promise that resolves when the collection is dropped.
	 */
	static async dropCollection(collectionName) {
		return mongoose.connection.dropCollection(collectionName);
	}

	/**
	 * Disconnects from the currently connected MongoDB database.
	 *
	 * @returns {Promise<void>} A promise that resolves when the disconnection is successful.
	 */
	static async disconnect() {
		return mongoose.disconnect();
	}

	/**
	 * Closes the MongoDB database connection.
	 *
	 * @returns {Promise<void>} A promise that resolves when the connection is closed.
	 */
	static async closeConnection() {
		return mongoose.connection.close();
	}
}

module.exports = MongoConnection;
