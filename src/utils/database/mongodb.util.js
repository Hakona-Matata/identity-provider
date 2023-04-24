const mongoose = require("mongoose");

class MongoDatabaseUtil {
	static async connect() {
		const MONGO_URI = process.env.NODE_ENV === "test" ? process.env.MONGO_URI + "_test" : process.env.MONGO_URI;

		mongoose.set("strictQuery", false);
		await mongoose.connect(MONGO_URI);
	}

	static async dropDataBase() {
		await mongoose.connection.dropDatabase();
	}

	static async dropCollection(collectionName) {
		await mongoose.connection.dropCollection(collectionName);
	}

	static async disconnect() {
		await mongoose.disconnect();
	}

	static async closeConnection() {
		await mongoose.connection.close();
	}
}

module.exports = MongoDatabaseUtil;
