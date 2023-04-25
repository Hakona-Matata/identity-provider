const { startServer, closeServer } = require("./app");

const port = process.env.NODE_ENV === "test" ? 5000 : process.env.PORT;

startServer(port);

const gracefulShutdown = async () => {
	await closeServer();
	process.exit(1);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
