const express = require("express");
require("dotenv").config();
require("express-async-errors");

const { MongoDatabaseUtil } = require("./utils/database/index");
const applyAllMiddlewares = require("./middlewares/applyAllMiddlewares");

const app = express();

const startServer = async () => {
	await MongoDatabaseUtil.connect();

	applyAllMiddlewares(app);

	const port = process.env.PORT || 3000;

	app.listen(port, () => {
		console.log(`Server is running on ${process.env.BASE_URL}:${port} in "${process.env.NODE_ENV}" environment`);
	});
};

const gracefulShutdown = async () => {
	await MongoDatabaseUtil.disconnect();
	await MongoDatabaseUtil.closeConnection();
	process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

startServer();
