const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index.js");
const {
	SUCCESS_MESSAGES: { SESSION_CANCELED_SUCCESSFULLY },
	FAILURE_MESSAGES: { SESSION_REVOKED },
} = require("./../session.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services.js");
const SessionServices = require("./../../session/session.services.js");

const baseURL = "/auth/account/sessions/";

describe(`Auth API - Cancel/Revoke a session endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code when session is canceled/ revoked successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const currentSession = await SessionServices.findOne({
			accessToken,
			accountId: account._id,
		});

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ sessionId: currentSession._id });
		console.log({ body });
		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: SESSION_CANCELED_SUCCESSFULLY,
		});
	});

	it("Should return 403 status code when the given session is not his", async () => {
		const fakeAccount1 = generateFakeAccount();
		const fakeAccount2 = generateFakeAccount();

		const account1 = await AccountServices.createOne({
			...fakeAccount1,
		});

		const account2 = await AccountServices.createOne({
			...fakeAccount2,
		});

		const {
			body: {
				result: { accessToken: accessToken1 },
			},
		} = await request(app).post("/auth/login").send({ email: account1.email, password: fakeAccount1.password });

		const {
			body: {
				result: { accessToken: accessToken2 },
			},
		} = await request(app).post("/auth/login").send({ email: account2.email, password: fakeAccount2.password });

		const account2CurrentSession = await SessionServices.findOne({
			accountId: account2._id,
			accessToken: accessToken2,
		});

		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken1}`)
			.send({ sessionId: account2CurrentSession._id });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: SESSION_REVOKED,
		});
	});

	it("Should return 404 status code when no access token is found", async () => {
		const { status, body } = await request(app)
			.post(baseURL)

			.send({ sessionId: "x".repeat(24) });

		expect(status).toBe(httpStatusCodeNumbers.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.NOT_FOUND,
			code: httpStatusCodeStrings.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});

	it("Should return 422 status code when sessionId is not provided", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).post(baseURL).set("authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"sessionId" field is required!']),
		});
	});

	it("Should return 422 status code when sessionId is empty", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"sessionId" field is required!`]),
		});
	});

	it("Should return 422 status code when sessionId is not of type string", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: +"1".repeat(24) });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "sessionId"!`]),
		});
	});

	it("Should return 422 status code when sessionId is not valid mongoose ID", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "x".repeat(24) });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid value for "sessionId"!`]),
		});
	});
});
