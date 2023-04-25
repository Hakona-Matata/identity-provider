const { describe, it, expect } = require("jest");

const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../../constants/index");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const app = require("../../../src/server");
const { connect, disconnect } = require("../../db.config");
const { generate_hash } = require("./../../../src/helpers/hash");

const User = require("./../../../src/app/Models/User.model");

const baseURL = "/auth/logout";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Log user out`, () => {
	it("1. it should log user out successfully", async () => {
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
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			data: "Logged out successfully",
		});
	});

	it("2. No accessToken is provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: "Sorry, the access token is required!",
		});
	});

	it("3. Malformed accessToken", async () => {
		const { status, body } = await request(app).post(baseURL).set("authorization", "Bearer test");

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: `Sorry, the token is invalid!`,
		});
	});

	it("4. Invalid accessToken", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.set(
				"authorization",
				`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
			);

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: `Sorry, the token is invalid!`,
		});
	});

	it("5. Logout route is private", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: "Sorry, the access token is required!",
		});
	});
});
