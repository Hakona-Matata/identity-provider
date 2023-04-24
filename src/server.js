const express = require("express");
require("dotenv").config();
require("express-async-errors");
const { MongoDatabaseUtil } = require("./utils/database/index");
const applyAllMiddlewares = require("./middlewares/applyAllMiddlewares");

const app = express();

let server;

const startServer = async (givenPort) => {
	await MongoDatabaseUtil.connect();
	applyAllMiddlewares(app);
	const port = givenPort || process.env.PORT || 3000;

	server = app.listen(port, () => {
		if (process.env.NODE_ENV !== "test") {
			console.log(`Server is running on ${process.env.BASE_URL}:${port} in "${process.env.NODE_ENV}" environment`);
		}
	});

	process.on("SIGINT", gracefulShutdown);
	process.on("SIGTERM", gracefulShutdown);

	return server;
};

const closeServer = async () => {
	if (process.env.NODE_ENV === "test") {
		await MongoDatabaseUtil.dropDataBase();
	}

	await MongoDatabaseUtil.disconnect();
	await MongoDatabaseUtil.closeConnection();

	server.close();
};

const gracefulShutdown = async () => {
	await closeServer();
	process.exit(1);
};

module.exports = { app, startServer, closeServer };
