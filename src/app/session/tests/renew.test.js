const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");
const { generate_token } = require("./../../../src/helpers/token");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");

const baseURL = "/auth/sessions/renew";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Renew User Session`, () => {
	it("1. Renew user session successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const {
			body: {
				data: { refreshToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken });

		expect(status).toBe(STATUS.CREATED);
		expect(body.success).toBe(true);
		expect(body.status).toBe(STATUS.CREATED);
		expect(body.code).toBe(CODE.CREATED);
		expect(body).toHaveProperty("data.accessToken");
		expect(body).toHaveProperty("data.refreshToken");
		expect(typeof body.data.accessToken).toBe("string");
		expect(typeof body.data.refreshToken).toBe("string");
	});

	it("2. The session associated to this refresh token is revoked/ disabled", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const {
			body: {
				data: { refreshToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		await Session.findOneAndDelete({
			userId: user.id.toString(),
			refreshToken,
		});

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken });

		expect(status).toBe(STATUS.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, this refresh token is revoked/ disabled!",
		});
	});

	it("3. Given refresh token is expired", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const expiredRefreshToken = await generate_token({
			payload: { userId: user.id },
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: 1, // expires in 1 second!
		});

		await User.findOneAndDelete({ _id: user.id.toString() });

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: expiredRefreshToken });

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, the token is expired!",
		});
	});

	it("4. Given refresh token has invalid signature", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const invalidRefreshToken = await generate_token({
			payload: { userId: user.id },
			secret: "random key hereeeeeeeeeeeee",
			expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
		});

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: invalidRefreshToken });

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, the token is invalid!",
		});
	});

	//==============================================================

	it("5. Refresh token is not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"refreshToken" field is required!`],
		});
	});

	it("6. Refresh token can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: "" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"refreshToken" field can't be empty!`],
		});
	});

	it("7. Refresh token is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: +"1".repeat(210) });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"refreshToken" field has to be of type string!`],
		});
	});

	it("8. Refresh token is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: "1" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"refreshToken" field can't be true!`],
		});
	});

	it("9. Refresh token is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: "1".repeat(210) });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"refreshToken" field can't be true!`],
		});
	});
});
