const mongoose = require("mongoose");

class MongoDatabaseUtil {
	static async connect() {
		mongoose.set("strictQuery", false);
		await mongoose.connect(process.env.MONGO_URI);
	}

	static async dropDataBase() {
		await mongoose.connection.dropDatabase();
	}

	static async dropCollection(collectionName) {
		await mongoose.connection.dropCollection(collectionName);
	}

	static async disonnect() {
		await mongoose.disconnect();
	}

	static async closeConnection() {
		await mongoose.connection.close();
	}
}

module.exports = MongoDatabaseUtil;
