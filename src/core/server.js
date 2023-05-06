const { startServer, closeServer } = require("./app");
const config = require("./../infrastructure/config/environments");

/**
 * Determine the port based on the environment.
 * If the environment is "test", use port 5000, otherwise use the value from the PORT environment variable.
 * @type {number}
 */

const port = config.host.port;

startServer(port);

/**
 * Gracefully shut down the server by closing it and exiting the process with an exit code of 1.
 * @returns {Promise<void>}
 */
const gracefulShutdown = async () => {
	await closeServer();
	process.exit(1);
};

// Listen for the SIGINT signal (Ctrl+C) to trigger a graceful shutdown
process.on("SIGINT", gracefulShutdown);

// Listen for the SIGTERM signal to trigger a graceful shutdown
process.on("SIGTERM", gracefulShutdown);
