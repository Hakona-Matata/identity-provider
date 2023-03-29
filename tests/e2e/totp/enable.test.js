const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");

const baseURL = "/auth/totp/enable";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Enable TOTP as a layer`, () => {
	it("1. Initiate enabling TOTP successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.OK);
		expect(body.success).toBe(true);
		expect(body.status).toBe(STATUS.OK);
		expect(body.code).toBe(CODE.OK);
		expect(body.data).toHaveProperty("secret");
	});

	it("2. TOTP is already enabled", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		await User.findOneAndUpdate(
			{ _id: user.id },
			{ $set: { isTOTPEnabled: true } }
		);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, you already enabled TOTP!",
		});
	});

	it("3. Re-initiate TOTP enabling", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.OK);
		expect(body.success).toBe(true);
		expect(body.status).toBe(STATUS.OK);
		expect(body.code).toBe(CODE.OK);
		expect(body.data).toHaveProperty("secret");
	});

	it("4. Initiate TOTP route is private", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, the access token is required!",
		});
	});
});
