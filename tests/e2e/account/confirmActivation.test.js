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

describe(`"GET" ${baseURL} - Confirm activate User Account`, () => {
	it("1. Activate user account successfully", async () => {
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

		// (4) Initiate user account activation
		await request(app).put(baseURL).send({ email: user.email });

		// (5) Confirm activation
		const { status, body } = await request(app).get(
			`${baseURL}/${activationToken}`
		);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (6) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("Account is activated successfully");
	});

	it("2. Already confirmed account activation", async () => {
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

		// (4) Initiate user account activation
		await request(app).put(baseURL).send({ email: user.email });

		// (5) Confirm activation
		await request(app).get(`${baseURL}/${activationToken}`);

		// (6) Trying to confirm again!
		const { status, body } = await request(app).get(
			`${baseURL}/${activationToken}`
		);

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe(
			"Sorry, you already confirmed your email activation!"
		);
	});

	it("3. Provided verificationToken is too short to be true", async () => {
		const { status, body } = await request(app).get(`${baseURL}/${12}`);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"activationToken" param can't be true!`);
	});

	it("4. Provided verificationToken is too short to be true", async () => {
		const { status, body } = await request(app).get(
			`${baseURL}/${"t".repeat(500)}`
		);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"activationToken" param can't be true!`);
	});

	it("5. No verificationToken is provided ", async () => {
		const { status, body } = await request(app).get(`${baseURL}/`);

		expect(status).toBe(404);
	});
});
