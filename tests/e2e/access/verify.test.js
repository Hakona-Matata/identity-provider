const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const User = require("./../../../src/app/Models/User.model");
const { generate_token } = require("./../../../src/helpers/token");
const { generate_hash } = require("./../../../src/helpers/hash");

const baseURL = "/auth/verify-email";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"GET" ${baseURL} - Verify user email after sign up"`, () => {
	it("1. Email should be verified successfully", async () => {
		// (1) Create and save user into DB
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Create verification token
		const verificationToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.VERIFICATION_TOKEN_SECRET,
			expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN,
		});

		// (3) Update user document
		await User.findByIdAndUpdate(
			{ _id: user._id },
			{ $set: { verificationToken } }
		);

		// (4) Now, start our magic!
		const { status, body } = await request(app).get(
			`${baseURL}/${verificationToken}`
		);

		// (5) clean DB
		await User.findOneAndDelete({ _id: user._id });

		expect(status).toBe(200);
		expect(body.data).toBe("Your account is verified successfully");
	});

	it("2. Verification token isn't string", async () => {
		const { status, body } = await request(app).get(baseURL + `/` + 1);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"verificationToken" param can't be true!`);
	});

	it("3. Verification token isn't provided", async () => {
		const { status, body } = await request(app).get(baseURL + `/`);

		// This means the route it self is not found!
		expect(status).toBe(404);
	});

	it("4. Verification token is too short to be true", async () => {
		const { status, body } = await request(app).get(baseURL + `/12`);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"verificationToken" param can't be true!`);
	});

	it("5. Verification token is too long to be true", async () => {
		const { status, body } = await request(app).get(
			baseURL + `/${"blabla".repeat(50)}`
		);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"verificationToken" param can't be true!`);
	});
});
