const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { CANCELED_ACCOUNT_DELETION },
	FAILURE_MESSAGES: { ACCOUNT_IS_DELETED, ALREADY_CANCELED_ACCOUNT_DELETION },
} = require("./../account.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../account.services.js");

const baseURL = "/auth/account/cancel-delete";

describe(`Identity Provider API - Cancel account deletion endpoint "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: true,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when account deletion is canceled successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const { status, body } = await request(app).put(baseURL).send({ email: account.email });

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: CANCELED_ACCOUNT_DELETION,
		});
	});

	it("Should return 400 status code when account is deleted permanently", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			email: "testtest@gmail.com",
		});

		expect(status).toBe(httpStatusCodes.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.BAD_REQUEST,
			code: httpStatusMessages.BAD_REQUEST,
			message: ACCOUNT_IS_DELETED,
		});
	});

	it("Should return 400 status code when account deletion is already canceled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isDeleted: false,
		});

		const { status, body } = await request(app).put(baseURL).send({
			email: account.email,
		});

		expect(status).toBe(httpStatusCodes.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.BAD_REQUEST,
			code: httpStatusMessages.BAD_REQUEST,
			message: ALREADY_CANCELED_ACCOUNT_DELETION,
		});
	});

	it("Should return 422 status code when email is not provided", async () => {
		const { status, body } = await request(app).put(baseURL).send();

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"email" field is required!']),
		});
	});

	it("Should return 422 status code when email field is not fof type string", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: 111111111111111 });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "email"!`]),
		});
	});

	it("Should return 422 status code when email is too short", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: "t@test.com" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"email" field should have a minimum length of 15!`]),
		});
	});

	it("Should return 422 status code when email is too long", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: `${"t".repeat(50)}@test.com` });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"email" field should have a maximum length of 40!`]),
		});
	});

	it("Should return 422 status code when email is not of type string", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: 111111111111 });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "email"!`]),
		});
	});

	it("Should return 422 status code when email is empty", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: "" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"email" field is required!`]),
		});
	});
});
