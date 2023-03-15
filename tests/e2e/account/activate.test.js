const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const User = require("./../../../src/app/Models/User.model");

const { generate_hash } = require("./../../../src/helpers/hash");
const { generate_token } = require("./../../../src/helpers/token");

const baseURL = "/auth/account/activate";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"PUT" ${baseURL} - Initiate User Account Activation`, () => {
	it("1. Initiate activate user account successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Activate user account
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe(
			"Please, check your mailbox to confirm your account activation\n" +
				"You only have 1h"
		);
	});

	it("2. Provided email is not found in our DB", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "blasfasdf@gma.com" });

		expect(status).toBe(200);
		expect(body.data).toBe(
			`Please, check your mailbox to confirm your account activation\nYou only have ${process.env.ACTIVATION_TOKEN_EXPIRES_IN}`
		);
	});

	it("3. User account is already active", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Activate user account
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your account is already active!");
	});

	it("4. User already have a valid verification token in his mailbox", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Create activation token
		const activationToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.ACTIVATION_TOKEN_SECRET,
			expiresIn: process.env.ACTIVATION_TOKEN_EXPIRES_IN,
		});

		// (3) Update user document
		await User.findOneAndUpdate(
			{ _id: user._id },
			{ $set: { activationToken } }
		);

		// (4) Activate user account
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		expect(status).toBe(401);
		expect(body.data).toBe(
			"Sorry, you still have a valid link in your mailbox!"
		);
	});

	it("5. Provided email is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: 1234324 });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field has to be of type string!');
	});

	it("6. Provided email is not a valid email", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "testsetsesttesttest" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field has to be a valid email!`);
	});

	it("7. Provided email is too short to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "test" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"email" field can't be less than 15 characters!`
		);
	});

	it("8. Provided email is too long to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "test".repeat(50) });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be more than 40 characers!`);
	});

	it("9. Provided email can't be empty", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be empty!`);
	});

	it("10. No email is provided", async () => {
		const { status, body } = await request(app).put(baseURL);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field is required!`);
	});
});
