const { startServer, closeServer } = require("./src/core/app");

beforeAll(async () => {
	await startServer();
});

afterAll(async () => {
	await closeServer();
});
