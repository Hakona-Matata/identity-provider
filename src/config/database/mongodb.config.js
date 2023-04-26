const mongoose = require("mongoose");

class MongoDatabaseConfig {
	static async connect() {
		const MONGO_URI = process.env.NODE_ENV === "test" ? process.env.MONGO_URI + "_test" : process.env.MONGO_URI;

		mongoose.set("strictQuery", false);
		return mongoose.connect(MONGO_URI, {
			connectTimeoutMS: 30000,
		});
	}

	static async dropDataBase() {
		return mongoose.connection.dropDatabase();
	}

	static async dropCollection(collectionName) {
		return mongoose.connection.dropCollection(collectionName);
	}

	static async disconnect() {
		return mongoose.disconnect();
	}

	static async closeConnection() {
		return mongoose.connection.close();
	}
}

module.exports = MongoDatabaseConfig;
