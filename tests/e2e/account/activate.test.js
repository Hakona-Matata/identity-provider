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

describe(`"PUT" ${baseURL} - Activate User Account`, () => {
	it("1. Activate user account successfully", async () => {
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

		console.log({ status, body });

		expect(status).toBe(401);
		expect(body.data).toBe(
			"Sorry, you still have a valid link in your mailbox!"
		);
	});
});
