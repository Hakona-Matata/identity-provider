const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { CHECK_MAIL_BOX },
	FAILURE_MESSAGES: { ALREADY_HAVE_VALID_RESET_LINK },
} = require("./../password.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services");

const baseURL = "/auth/account/password/forget";

describe(`Identity Provider API - Forget password endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code when initiating forget password don successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
		});
		
		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: CHECK_MAIL_BOX,
		});
	});

	it("Should return 200 status code when email is not found in our DB", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "blabla@gmail.com" });

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: CHECK_MAIL_BOX,
		});
	});

	it("Should return 403 status code when email forget is already initiated", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		await request(app).post(baseURL).send({
			email: account.email,
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
		});

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: ALREADY_HAVE_VALID_RESET_LINK,
		});
	});

	it("Should return 422 status code when email field is not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"email" field is required!']),
		});
	});

	it("Should return 422 status code when email field is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"email" field is required!`]),
		});
	});

	it("Should return 422 status code when email field is too short", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "q@gmail.com" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"email" field should have a minimum length of 15!`]),
		});
	});

	it("Should return 422 status code when email field is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: `${"s".repeat(200)}@gmail.com` });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"email" field should have a maximum length of 40!`,
				`Invalid email address for "email"!`,
			]),
		});
	});

	it("Should return 422 status code when email field is not in valid format", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: `dsfaasdfsadfadfgmailcom` });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid email address for "email"!`]),
		});
	});

	it("Should return 422 status code when email field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: +"1".repeat(20) });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "email"!`]),
		});
	});
});
