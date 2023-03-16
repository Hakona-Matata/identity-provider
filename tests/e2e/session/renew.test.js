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
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get the needed tokens
		const {
			body: {
				data: { refreshToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Renew user session
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		// (5) Our expectations
		expect(status).toBe(200);
		expect(body).toHaveProperty("data.accessToken");
		expect(body).toHaveProperty("data.refreshToken");
	});

	it("2. The session associated to this refresh token is revoked/ disabled", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get the needed tokens
		const {
			body: {
				data: { refreshToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Delete this session (the idea is to generate not expired, valid token!)
		await Session.findOneAndDelete({
			userId: user.id.toString(),
			refreshToken,
		});

		// (4) Renew Session
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id.toString() });

		// (6) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, this refresh token is revoked/ disabled!");
	});

	it("3. Given refresh token is expired", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Generate expired refresh token
		const expiredRefreshToken = await generate_token({
			payload: { userId: user.id },
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: 1, // expires in 1 second!
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id.toString() });

		// (4) Wait a second
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// (5) Renew user session
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: expiredRefreshToken });

		// (6) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your token is expired!");
	});

	it("4. Given refresh token is malformed", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Generate expired refresh token
		const invalidRefreshToken = await generate_token({
			payload: { userId: user.id },
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id.toString() });

		// (4) Renew user session
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: `${invalidRefreshToken.slice(-5)}12345` });

		// (5) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your token is malformed!");
	});

	it("5. Given refresh token has invalid signature", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Generate expired refresh token
		const invalidRefreshToken = await generate_token({
			payload: { userId: user.id },
			secret: "random key hereeeeeeeeeeeee",
			expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id.toString() });

		// (4) Renew user session
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: invalidRefreshToken });

		// (5) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your token is invalid!");
	});

	//==============================================================

	it("6. Refresh token is not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"refreshToken" field is required!`);
	});

	it("7. Refresh token can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: "" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"refreshToken" field can't be empty!`);
	});

	it("8. Refresh token is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: +"1".repeat(210) });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"refreshToken" field has to be of type string!`);
	});

	it("9. Refresh token is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: "1" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"refreshToken" field can't be true!`);
	});

	it("10. Refresh token is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: "1".repeat(210) });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"refreshToken" field can't be true!`);
	});
});
