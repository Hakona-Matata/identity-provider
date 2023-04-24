const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_token } = require("../../../src/helpers/token");
const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");

const baseURL = "/auth/sessions/";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"GET" ${baseURL} - Get All user sessions (valid, expired)`, () => {
	it("1. Get all user sessions successfully (Only valid token there!)", async () => {
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
			.get(baseURL)
			.set("authorization", `Bearer ${accessToken}`);

		const currentSession = await Session.findOne({ accessToken });

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: { count: 1, sessions: [{ _id: currentSession.id, isValid: true }] },
		});
	});

	it("2. Get all user sessions (valid and expired) ones", async () => {
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

		const validSession = await Session.findOne({
			userId: user.id,
			accessToken,
		});

		const fakeAccessToken = await generate_token({
			payload: { _id: user.id },
			secret: process.env.ACCESS_TOKEN_SECRET,
			expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
		});
		const fakeRefreshToken = await generate_token({
			payload: { _id: user.id },
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: 1, // expires In 1 second!
		});

		const expiredSession = await Session.create({
			userId: user.id.toString(),
			accessToken: fakeAccessToken,
			refreshToken: fakeRefreshToken,
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const { status, body } = await request(app)
			.get(baseURL)
			.set("authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: {
				count: 2,
				sessions: [
					{ _id: validSession.id, isValid: true },
					{
						_id: expiredSession.id,
						isValid: false,
					},
				],
			},
		});
	});

	it("3. Returned sessions should be sorted (valid then, expired)", async () => {
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

		const validSession = await Session.findOne({
			userId: user.id,
			accessToken,
		});

		const fakeAccessToken = await generate_token({
			payload: { _id: user.id },
			secret: process.env.ACCESS_TOKEN_SECRET,
			expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
		});
		const fakeRefreshToken = await generate_token({
			payload: { _id: user.id },
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: 1, // expires In 1 second!
		});

		const expiredSession = await Session.create({
			userId: user.id.toString(),
			accessToken: fakeAccessToken,
			refreshToken: fakeRefreshToken,
		});

		const { status, body } = await request(app)
			.get(baseURL)
			.set("authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: {
				count: 2,
				sessions: [
					{ _id: validSession.id, isValid: true },
					{
						_id: expiredSession.id,
						isValid: false,
					},
				],
			},
		});
	});
});
