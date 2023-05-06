const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { CHECK_MAIL_BOX },
	FAILURE_MESSAGES: { ACCOUNT_NEED_TO_BE_VERIFIED, ACCOUNT_IS_DELETED, ALREADY_HAVE_VALID_ACTIVATION_LINK },
} = require("./../account.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { app } = require("../../../../core/app");

const AccountServices = require("./../account.services.js");

const { TokenHelper } = require("../../../../shared/helpers");

const baseURL = "/auth/account/activate";

describe(`Identity Provider API - Initiate account activation endpoint "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when Initiating account is done successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const { status, body } = await request(app).put(baseURL).send({ email: account.email });

		expect(status).toBe(200);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: CHECK_MAIL_BOX,
		});
	});

	it("Should return 200 status code when provided email is not found in our DB", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: "blasfasdf@gma.com" });

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: CHECK_MAIL_BOX,
		});
	});

	it("Should return 403 status code when account isn't verified yet", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isVerified: false,
		});

		const { status, body } = await request(app).put(baseURL).send({ email: account.email });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: ACCOUNT_NEED_TO_BE_VERIFIED,
		});
	});

	it("Should return 403 status code when account is temp deleted", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isDeleted: true,
		});

		const { status, body } = await request(app).put(baseURL).send({ email: account.email });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: ACCOUNT_IS_DELETED,
		});
	});

	it("Should returns 403 status code when account is already active", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isActive: true,
		});

		const { status, body } = await request(app).put(baseURL).send({ email: account.email });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: "Sorry, your account is already active!",
		});
	});

	it("Should return 400 status code when already initiated account activation", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const activationToken = await TokenHelper.generateActivationToken({
			accountId: account._id,
			role: account.role,
		});

		await AccountServices.updateOne({ _id: account._id }, { activationToken });

		const { status, body } = await request(app).put(baseURL).send({ email: account.email });

		expect(status).toBe(httpStatusCodes.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.BAD_REQUEST,
			code: httpStatusMessages.BAD_REQUEST,
			message: ALREADY_HAVE_VALID_ACTIVATION_LINK,
		});
	});

	it("Should return 200 status code when no access token is found", async () => {
		const { status } = await request(app).put(baseURL).send({ email: "test2332@gmail.com" });

		expect(status).toBe(200);
	});

	it("Should return 400 status code when email is not provided", async () => {
		const { status, body } = await request(app).put(baseURL);

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"email" field is required!`]),
		});
	});

	it("Should return 400 status code when email is not of type string", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: 1234324 });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "email"!`]),
		});
	});

	it("Should return 400 status code when email is not valid", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: "testsetsesttesttest" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['Invalid email address for "email"!']),
		});
	});

	it("Should return 400 status code when email is too short", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: "test" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"email" field should have a minimum length of 15!',
				'Invalid email address for "email"!',
			]),
		});
	});

	it("Should return 400 status code when email is too long", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "test".repeat(50) });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"email" field should have a maximum length of 40!',
				'Invalid email address for "email"!',
			]),
		});
	});

	it("Should return 400 status code when email is empty", async () => {
		const { status, body } = await request(app).put(baseURL).send({ email: "" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);

		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"email" field is required!']),
		});
	});
});
