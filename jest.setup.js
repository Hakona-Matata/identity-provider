const { startServer, closeServer } = require("./src/app");

beforeAll(() => {
	startServer();
});

afterAll(() => {
	closeServer();
});
