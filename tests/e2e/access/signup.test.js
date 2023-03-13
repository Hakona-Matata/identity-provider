const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const baseURL = "/auth";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

const fakeUser = {
	email: faker.internet.email(),
	userName: faker.internet.userName("Jeanne"),
	password: "teTE!@12",
	confirmPassword: "teTE!@12",
};

describe(`"POST "${baseURL}/sign-up"`, () => {
	it(`1. create new user - should be successful!`, async () => {
		const { status, body } = await request(app)
			.post(`${baseURL}/sign-up`)
			.send({
				...fakeUser,
			});

		console.log(body);
		expect(status).toBe(200);
	});
});
