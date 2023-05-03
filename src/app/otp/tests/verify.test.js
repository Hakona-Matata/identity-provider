const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants");
const {
	FAILURE_MESSAGES: { EXPIRED_OTP, INVALID_OTP, REACHED_MAXIMUM_WRONG_TRIES },
} = require("./../otp.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");
const OtpServices = require("./../otp.services");

const { RandomGenerator, HashHelper } = require("./../../../helpers");

const baseURL = "/auth/account/otp/verify";

describe(`Auth API - Verify OTP endpoint (during login process) "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOtpEnabled: true,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when otp code is verified successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isOtpEnabled: true,
		});

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await OtpServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app).post(baseURL).send({
			accountId: account._id,
			otp: plainTextOtp.toString(),
		});

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

	it("Should return 403 status code when otp code is expired", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isOtpEnabled: true,
		});

		const { status, body } = await request(app).post(baseURL).send({
			accountId: account._id,
			otp: "123123",
		});

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: EXPIRED_OTP,
		});
	});

	it("Should return 403 status code when otp code is invalid", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isOtpEnabled: true,
		});

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await OtpServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app).post(baseURL).send({
			accountId: account._id,
			otp: "123123",
		});

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: INVALID_OTP,
		});
	});

	it("Should return 403 status code when user sends more than 3 wrong times", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isOtpEnabled: true,
		});

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await OtpServices.createOne({ accountId: account._id, hashedOtp });

		await request(app).post(baseURL).send({
			accountId: account._id,
			otp: "123123",
		});
		await request(app).post(baseURL).send({
			accountId: account._id,
			otp: "123123",
		});
		await request(app).post(baseURL).send({
			accountId: account._id,
			otp: "123123",
		});
		const { status, body } = await request(app).post(baseURL).send({
			accountId: account._id,
			otp: "123123",
		});

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: REACHED_MAXIMUM_WRONG_TRIES,
		});
	});

	it("Should return 422 status code when otp code is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ accountId: "64141cb6c9a4394fcdf04e37" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field is required!`]),
		});
	});

	it("Should return 422 status code when otp code is empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)

			.send({ otp: "", accountId: "64141cb6c9a4394fcdf04e37" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field is required!`]),
		});
	});

	it("Should return 422 status code when otp code is not of type String", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: 123456, accountId: "64141cb6c9a4394fcdf04e37" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "otp"!`]),
		});
	});

	it("Should return 422 status code when otp code is too short", async () => {
		const { status, body } = await request(app)
			.post(baseURL)

			.send({ otp: "12345", accountId: "64141cb6c9a4394fcdf04e37" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field should have a length of 6!`]),
		});
	});

	it("Should return 422 status code when otp code is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: "1234567", accountId: "64141cb6c9a4394fcdf04e37" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field should have a length of 6!`]),
		});
	});

	it("Should return 422 status code when accountId field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				otp: "123123",
				accountId: +"1".repeat(24),
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "accountId"!`]),
		});
	});

	it("Should return 422 status code when accountId field is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			otp: "123123",
			accountId: "",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"accountId" field is required!`]),
		});
	});

	it("Should return 422 status code when accountId field is not a valid mongodb ID", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			otp: "123123",
			accountId: "1234",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid value for "accountId"!`]),
		});
	});
});
