/**
 * Express application instance.
 * @type {import("express").Application}
 */
const express = require("express");

/**
 * Loads environment variables from a .env file.
 */
require("dotenv").config();

/**
 * Handles async errors and passes them to Express error middleware.
 */
require("express-async-errors");

/**
 * Configuration for the MongoDB database.
 * 
 * @type {import("./config/database/index").MongoDatabaseConfig}
 */
const { MongoDatabaseConfig } = require("./config/database/index");

/**
 * Applies all middlewares to the Express application.
 * 
 * @type {import("./middlewares/applyAllMiddlewares")}
 */
const applyAllMiddlewares = require("./middlewares/applyAllMiddlewares");

/**
 * Express application instance.
 * @type {import("express").Application}
 */
const app = express();

/**
 * Starts the server on the specified port.
 * 
 * @param {number} port - The port on which the server should listen.
 * @returns {import("http").Server} The server instance.
 */
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

/**
 * Closes the server and performs necessary cleanup.
 * 
 * @returns {Promise<void>}
 */
const closeServer = async () => {
	if (process.env.NODE_ENV === "test") {
		await MongoDatabaseConfig.dropDataBase();
	}

	await MongoDatabaseConfig.disconnect();
	await MongoDatabaseConfig.closeConnection();
};

module.exports = { app, startServer, closeServer };
