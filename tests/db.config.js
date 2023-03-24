const mongoose = require("mongoose");

const connect = async () => {
	try {
		mongoose.set("strictQuery", true);
		return await mongoose.connect(
			`${process.env.MONGO_URI}/${process.env.NODE_ENV}`
		);
	} catch (error) {
		console.error(error);
	}
};

const disconnect = async () => {
	try {
		await mongoose.connection.dropDatabase();
		await mongoose.disconnect();
		return await mongoose.connection.close();
	} catch (error) {
		console.error(error);
	}
};

module.exports = { connect, disconnect };
