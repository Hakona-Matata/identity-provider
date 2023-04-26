const express = require("express");
require("dotenv").config();
require("express-async-errors");
const { MongoDatabaseConfig } = require("./config/database/index");
const applyAllMiddlewares = require("./middlewares/applyAllMiddlewares");

const app = express();

const startServer = async (port) => {
	await MongoDatabaseConfig.connect();

	applyAllMiddlewares(app);

	const server = app.listen(port, () => {
		if (process.env.NODE_ENV !== "test") {
			console.log(`Server is running on ${process.env.BASE_URL}:${port} in "${process.env.NODE_ENV}" environment`);
		}
	});

	return server;
};

const closeServer = async () => {
	if (process.env.NODE_ENV === "test") {
		// await MongoDatabaseConfig.dropDataBase();
	}

	await MongoDatabaseConfig.disconnect();
	await MongoDatabaseConfig.closeConnection();
};

module.exports = { app, startServer, closeServer };
