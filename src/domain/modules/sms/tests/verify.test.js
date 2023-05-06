const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	FAILURE_MESSAGES: { CANNOT_VERIFY, EXPIRED_SMS, INVALID_OTP, REACHED_MAXIMUM_WRONG_TRIES },
} = require("./../sms.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services");
const SmsServices = require("./../sms.services");

const { RandomGenerator, HashHelper } = require("./../../../../shared/helpers");

const baseURL = "/auth/account/sms/verify";

describe(`Identity Provider API - Verify OTP over SMS endpoint (during login)"${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isSmsEnabled: true,
			phone: "+201210101010",
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when verification of OTP over SMS succeeds", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await SmsServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ accountId: account._id, otp: plainTextOtp.toString() });

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

	it("Should return 403 status code when OTP over SMS feature is not enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isSmsEnabled: false,
		});

		const { status, body } = await request(app).post(baseURL).send({ accountId: account._id, otp: "123123" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: CANNOT_VERIFY,
		});
	});

	it("should return 403 status code when otp code over SMS is expired", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isSmsEnabled: true,
		});

		const { status, body } = await request(app).post(baseURL).send({ accountId: account._id, otp: "123123" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: EXPIRED_SMS,
		});
	});

	it("Should return 422 status code when OTP code over SMS is invalid", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await SmsServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app).post(baseURL).send({ accountId: account._id, otp: "123132" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: INVALID_OTP,
		});
	});

	it("Should return 403 status code when OTP code over SMS has been sent over 3 times wrong", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await SmsServices.createOne({ accountId: account._id, hashedOtp });

		await request(app).post(baseURL).send({ accountId: account._id, otp: "123132" });
		await request(app).post(baseURL).send({ accountId: account._id, otp: "123132" });
		await request(app).post(baseURL).send({ accountId: account._id, otp: "123132" });

		const { status, body } = await request(app).post(baseURL).send({ accountId: account._id, otp: "123132" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: REACHED_MAXIMUM_WRONG_TRIES,
		});
	});

	it("Should return 422 status code when accountId is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ otp: "123123" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"accountId" field is required!']),
		});
	});

	it("Should return 422 status code when accountId is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			accountId: "",
			otp: "123123",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"accountId" field is required!']),
		});
	});

	it("Should return 422 status code when accountId field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				accountId: +"1".repeat(24),
				otp: "123123",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['Invalid type, expected a string for "accountId"!']),
		});
	});

	it("Should return 422 status code when accountId is not valid mongodb ID", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			accountId: "1234",
			otp: "123123",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['Invalid value for "accountId"!']),
		});
	});

	it("Should return 422 status code when otp field is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ accountId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"otp" field is required!']),
		});
	});

	it("Should return 422 status code when otp field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: 123132, accountId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "otp"!`]),
		});
	});

	it("Should return 422 status code when otp field is too short", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: "123", accountId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field should have a length of 6!`]),
		});
	});

	it("Should return 422 status code when otp field is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: "123123123", accountId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field should have a length of 6!`]),
		});
	});
});
