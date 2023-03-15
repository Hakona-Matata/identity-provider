const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const User = require("./../../../src/app/Models/User.model");

const baseURL = "/auth/sign-up";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

const fakeUser = {
	email: faker.internet.email(),
	userName: faker.random.alpha(10),
	password: "teTE!@12",
	confirmPassword: "teTE!@12",
};

describe(`"POST" ${baseURL} - create new user"`, () => {
	it(`1. It should create a new user successfully`, async () => {
		// (1) Sign user up
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
			});

		// (2) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe(
			"Please, check your mailbox to verify your email address."
		);
	});

	it(`2. Duplicate userName`, async () => {
		// (1) Sign user up
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
			});

		// (2) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe("Sorry, this userName may be already taken!");
	});

	it("3. Duplicate email", async () => {
		// (1) Sign user up
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
				userName: faker.random.alpha(10),
			});

		// (2) Clean DB
		await User.findOneAndDelete({ userName: fakeUser.userName });

		// (3) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe("Sorry, this email may be already taken!");
	});

	it("4. Passwords don't match", async () => {
		// (1) Sign user Up
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: faker.internet.email(),
				userName: faker.random.alpha(10),
				password: "teTE!@12",
				confirmPassword: "teTE!@13",
			});

		// (2) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"confirmPassword" field doesn't match "password" field`
		);
	});

	it("5. No user inputs provided at all", async () => {
		// (1) Sign user Up
		const { status, body } = await request(app).post(baseURL);

		// (2) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field is required!');
		expect(body.data[1]).toBe('"userName" field is required!');
		expect(body.data[2]).toBe('"password" field is required!');
		expect(body.data[3]).toBe('"confirmPassword" is required');
	});

	it("6. userName is not found", async () => {
		// (1) Sign user up
		const { status, body } = await request(app).post(baseURL).send({
			email: faker.internet.email(),
			password: "teTE!@12",
			confirmPassword: "teTE!@13",
		});

		// (2) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe('"userName" field is required!');
	});

	it("7. email is not found", async () => {
		// (1) Sign user Up
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				userName: faker.random.alpha(10),
				password: "teTE!@12",
				confirmPassword: "teTE!@13",
			});

		// (2) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field is required!');
	});

	it("8. password is not found", async () => {
		// (1) Sign user up
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: faker.internet.email(),
				userName: faker.random.alpha(10),
				confirmPassword: "teTE!@13",
			});

		// (2) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe('"password" field is required!');
	});

	it("9. confirmPassword is not found", async () => {
		// (1) Sign user up
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: faker.internet.email(),
				userName: faker.random.alpha(10),
				password: "teTE!@13",
			});

		// (2) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe('"confirmPassword" is required');
	});
});
