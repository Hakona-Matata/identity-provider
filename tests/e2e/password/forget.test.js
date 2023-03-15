const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("./../../../src/helpers/hash");
const { generate_token } = require("./../../../src/helpers/token");

const User = require("./../../../src/app/Models/User.model");

const baseURL = "/auth/password/forget";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Forget Password`, () => {
	it("1. Initiate forget password successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Initiate password forgetting
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe(
			`Please, check your mailbox, the link is only valid for ${process.env.RESET_PASSWORD_EXPIRES_IN}!`
		);
	});

	it("2. Email is not among our DB users", async () => {
		// (1) Initiate password forgetting
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "blabla@gmail.com" });

		// (2) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe(
			`Please, check your mailbox, the link is only valid for ${process.env.RESET_PASSWORD_EXPIRES_IN}!`
		);
	});

	it("3. User already intiated forget password (should check his mailbox)", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Generate resetToken
		const resetToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.RESET_PASSWORD_SECRET,
			expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN,
		});

		// (3) Update user document
		await User.findOneAndUpdate({ _id: user._id }, { $set: { resetToken } });

		// (4) Initiate password forgetting
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
		});

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (6) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your mailbox already have a valid link!");
	});

	//===============================================================

	it("4. Email field is not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field is required!');
	});

	it("5. Email field can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be empty!`);
	});

	it("6. Email field too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "q@gmail.com" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"email" field can't be less than 15 characters!`
		);
	});

	it("7. Email field too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: `${"s".repeat(200)}@gmail.com` });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be more than 40 characers!`);
	});

	it("8. Email field is not a valid email", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: `dsfaasdfsadfadfgmailcom` });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field has to be a valid email!`);
	});

	it("8. Email field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: 1111111111111111111111111 });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field has to be of type string!`);
	});
});
