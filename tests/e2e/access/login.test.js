const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const User = require("./../../../src/app/Models/User.model");
const { generate_hash } = require("./../../../src/helpers/hash");

const baseURL = "/auth/login";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Log user In`, () => {
	it("1. Log user In successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data).toHaveProperty("accessToken");
		expect(body.data).toHaveProperty("refreshToken");
	});

	it("2. Given email is incorrect", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: "blabla@gmail.com",
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(422);
		expect(body.data).toBe(`Email or password is incorrect!`);
	});

	it("3. Given password is incorrect", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1233",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(422);
		expect(body.data).toBe(`Email or password is incorrect!`);
	});

	it("4. User email must be verified", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe(`Sorry, your email address isn't verified yet!`);
	});

	it("5. User account is inactive/ disabled", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe(`Sorry, you need to activate your email first!`);
	});

	it("6. User account has 1 2fa method active", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data.methods.length).toEqual(1);
		expect(body.data.userId).toEqual(user._id.toString());
		expect(body.data.message).toEqual(
			"Please, choose one of the given 2FA methods!"
		);
	});

	it("7. User account has 2 2fa method active", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			isTOTPEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data.methods.length).toEqual(2);
		expect(body.data.userId).toEqual(user._id.toString());
		expect(body.data.message).toEqual(
			"Please, choose one of the given 2FA methods!"
		);
	});

	it("8. User account has 3 2fa method active", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			isTOTPEnabled: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data.methods.length).toEqual(3);
		expect(body.data.userId).toEqual(user._id.toString());
		expect(body.data.message).toEqual(
			"Please, choose one of the given 2FA methods!"
		);
	});
});
