const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index.js");
const {
	FAILURE_MESSAGES: { SESSION_REVOKED },
} = require("./../session.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services.js");

const baseURL = "/auth/account/sessions/renew";

describe(`Auth API - Renew  session endpoint "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when session is regenerated successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { refreshToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).post(baseURL).send({ refreshToken });

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: {
				accessToken: expect.any(String),
				refreshToken: expect.any(String),
			},
		});
	});

	it("Should return 401 status code when given refresh token is invalid", async () => {
		const refreshToken =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

		const { status, body } = await request(app).post(baseURL).send({ refreshToken });

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: "Sorry, the given token is invalid!",
		});
	});

	it("Should return 403 status code when refresh token is already revoked/ disabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { refreshToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).post(baseURL).send({ refreshToken });
		const { status, body } = await request(app).post(baseURL).send({ refreshToken });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: SESSION_REVOKED,
		});
	});

	it("Should return 422 status code when refreshToken field is not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"refreshToken" field is required!`]),
		});
	});

	it("Should return 422 status code when refreshToken field is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ refreshToken: "" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"refreshToken" field is required!`]),
		});
	});

	it("Should return 422 status code when refreshToken field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: +"1".repeat(210) });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "refreshToken"!`]),
		});
	});

	it("Should return 422 status code when refreshToken field is too short", async () => {
		const { status, body } = await request(app).post(baseURL).send({ refreshToken: "1" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"refreshToken" field should have a minimum length of 64!`]),
		});
	});

	it("Should return 422 status code when refreshToken field is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken: "1".repeat(500) });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"refreshToken" field should have a maximum length of 300!`]),
		});
	});
});
