const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	FAILURE_MESSAGES: { WRONG_EMAIL_OR_PASSWORD },
} = require("./../auth.constants.js");
const {
	SUCCESS_MESSAGES: { OTP_SENT_SUCCESSFULLY },
} = require("./../../otp/otp.constants");

const { app } = require("../../../../core/app");
const request = require("supertest");
const { faker } = require("@faker-js/faker");

const AccountServices = require("./../../account/account.services");

const baseURL = "/auth/login";

describe(`Identity Provider API - Log In endpoint ${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when account has no 2fa methods enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const { email } = await AccountServices.createOne({
			...fakeAccount,
			isVerified: true,
		});

		const { status, body } = await request(app).post(baseURL).send({ email, password: "tesTES@!#1232" });

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: {
				accessToken: expect.any(String),
				refreshToken: expect.any(String),
			},
		});
	});

	it("Should return 200 status code when account has one 2fa methods enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isVerified: true,
			isActive: true,
			isOtpEnabled: true,
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: OTP_SENT_SUCCESSFULLY,
		});
	});

	it("Should return 200 status code when account has two 2fa methods enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isVerified: true,
			isActive: true,
			isOtpEnabled: true,
			isSmsEnabled: true,
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(httpStatusCodes.OK);
		expect(body.result).toHaveProperty("message");
		expect(body.result).toHaveProperty("accountId");
		expect(body.result).toHaveProperty("methods");
	});

	it("Should return 200 status code when account has three 2fa methods enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isVerified: true,
			isActive: true,
			isOtpEnabled: true,
			isTotpEnabled: true,
			isSmsEnabled: true,
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(httpStatusCodes.OK);
		expect(body.result).toHaveProperty("message");
		expect(body.result).toHaveProperty("accountId");
		expect(body.result).toHaveProperty("methods");
	});

	it("Should return 401 status code when no user is not found", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "test123@gmail.com", password: "tesTES@!#1232" });

		expect(status).toBe(httpStatusCodes.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNAUTHORIZED,
			code: httpStatusMessages.UNAUTHORIZED,
			message: WRONG_EMAIL_OR_PASSWORD,
		});
	});

	it("Should return 403 status code when given password is incorrect", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			password: "tesTES@!#1232",
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
			password: "tesTES@!#1233",
		});

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: "Sorry, your email address isn't verified yet!",
		});
	});

	it("Should return 403 status code when account email isn't verified", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: "Sorry, your email address isn't verified yet!",
		});
	});

	it("Should return 403 status code when account is inactive/ disabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isActive: false,
			isVerified: true,
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: "Sorry, your account is currently deactivated!",
		});
	});

	it("Should return 403 status code when account is deleted", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isVerified: true,
			isDeleted: true,
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: account.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: "Sorry, the account is deleted!",
		});
	});

	it("Should return 422 status code when email is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ password: "tesTES@!#1232" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"email" field is required!']),
		});
	});

	it("Should return 422 status code when password is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "test123@gmail.com" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: ['"password" field is required!'],
		});
	});

	it("Should return 422 status code when email is too short", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "t@test.com", password: "tesTT12!@" });

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
			.post(baseURL)
			.send({ email: `${"t".repeat(50)}@test.com`, password: "tesTT12!@" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"email" field should have a maximum length of 40!`]),
		});
	});

	it("Should return 422 status code when email is not of type string", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: 111111111111, password: "tesTT12!@" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "email"!`]),
		});
	});

	it("Should return 422 status code when email is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "", password: "tesTT12!@" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"email" field is required!`]),
		});
	});

	it("Should return 422 status code when password is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "test123@gmail.com",
			password: "",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"password" field is required!`]),
		});
	});

	it("Should return 422 status code when password is too short", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "test2312@gmail.com",
			password: "12",
		});

		expect(status).toBe(422);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters`,
			]),
		});
	});

	it("Should return 4222 status code when password is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: "teste23@gmail.com",
				password: `${"test".repeat(50)}`,
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters`,
			]),
		});
	});

	it("Should return 422 status code when password is not of string type", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "tests@gmaiol.com",
			password: 23532455,
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "password"!`]),
		});
	});
});
