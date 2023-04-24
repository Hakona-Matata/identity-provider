const { startServer, closeServer } = require("./src/server");

beforeAll(async () => {
	await startServer(4000);
});

afterAll(async () => {
	await closeServer();
});
