const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants");
const {
	FAILURE_MESSAGES: { CANNOT_VERIFY, EXPIRED_SMS, INVALID_OTP, REACHED_MAXIMUM_WRONG_TRIES },
} = require("./../sms.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");
const SmsServices = require("./../sms.services");

const { RandomGenerator, HashHelper } = require("./../../../helpers");

const baseURL = "/auth/account/sms/verify";

describe(`Auth API - Verify OTP over SMS endpoint (during login)"${baseURL}"`, () => {
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

	it("Should return 403 status code when OTP over SMS feature is not enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isSmsEnabled: false,
		});

		const { status, body } = await request(app).post(baseURL).send({ accountId: account._id, otp: "123123" });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
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

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
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

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
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

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: REACHED_MAXIMUM_WRONG_TRIES,
		});
	});

	it("Should return 422 status code when accountId is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ otp: "123123" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"accountId" field is required!']),
		});
	});

	it("Should return 422 status code when accountId is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			accountId: "",
			otp: "123123",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
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

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['Invalid type, expected a string for "accountId"!']),
		});
	});

	it("Should return 422 status code when accountId is not valid mongodb ID", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			accountId: "1234",
			otp: "123123",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['Invalid value for "accountId"!']),
		});
	});

	it("12. OTP code is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field is required!`);
	});

	it("13. OTP code has to be of type number", async () => {
		const { status, body } = await request(app).post(baseURL).send({ otp: "", userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be of type number!`);
	});

	it("14. OTP code has to be integer", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: +"11.2233", userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be integer!`);
	});

	it("15. OTP code has to be positive", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: -123123, userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be positive!`);
	});

	it("16. OTP code is too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({ otp: 123, userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be 6 digits!`);
	});

	it("17. OTP code is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: 123123123, userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be 6 digits!`);
	});
});
