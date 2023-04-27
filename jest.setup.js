const { startServer, closeServer } = require("./src/app");

beforeAll(async () => {
	await startServer();
});

afterAll(async () => {
	await closeServer();
});
