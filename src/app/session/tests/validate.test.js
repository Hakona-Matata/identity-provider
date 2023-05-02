const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("../../../constants/index.js");
const {
	FAILURE_MESSAGES: { SESSION_REVOKED },
} = require("./../session.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services.js");
const SessionServices = require("./../session.services.js");

const baseURL = "/auth/account/sessions/validate/";

describe(`Auth API - validate session endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code accessToken is valid", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).post(baseURL).send({ accessToken });

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: {
				isValid: true,
				accountId: expect.any(String),
				role: expect.any(String),
				label: "ACCESS_TOKEN",
				origin: "IDENTITY_PROVIDER",
				iat: expect.any(Number),
				exp: expect.any(Number),
			},
		});
	});

	it("Should return 401 status code when session is revoked/ canceled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await SessionServices.deleteOne({ accessToken });

		const { status, body } = await request(app).post(baseURL).send({ accessToken });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: SESSION_REVOKED,
		});
	});

	it("Should return 422 status code when accessToken field is not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"accessToken" field is required!`]),
		});
	});

	it("Should return 422 status code when accessToken field is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ accessToken: "" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"accessToken" field is required!`]),
		});
	});

	it("Should return 422 status code when accessToken field is not of type string ", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ accessToken: +"1234".repeat(300) });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "accessToken"!`]),
		});
	});

	it("Should return 422 status code when accessToken field is too short", async () => {
		const { status, body } = await request(app).post(baseURL).send({ accessToken: "12345" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"accessToken" field should have a minimum length of 64!`]),
		});
	});

	it("Should return 422 status code when accessToken field is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ accessToken: "1234".repeat(300) });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"accessToken" field should have a maximum length of 300!`]),
		});
	});
});
