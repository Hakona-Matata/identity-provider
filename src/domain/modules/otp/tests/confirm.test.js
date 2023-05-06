const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { OTP_CONFIRMED_SUCCESSFULLY },
	FAILURE_MESSAGES: { OTP_ALREADY_ENABLED, EXPIRED_OTP, REACHED_MAXIMUM_WRONG_TRIES, INVALID_OTP },
} = require("./../otp.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services");
const OtpServices = require("./../otp.services");

const { RandomGenerator, HashHelper } = require("./../../../../shared/helpers");

const baseURL = "/auth/account/otp/confirm";

describe(`Identity Provider API - Confirm Enabling OTP endpoint "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOtpEnabled: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("should return 200 status code when Otp enabling is confirmed successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await OtpServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: plainTextOtp.toString() });

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: OTP_CONFIRMED_SUCCESSFULLY,
		});
	});

	it("Should return 400 status code when otp feature is already enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isOtpEnabled: true });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "123456" });

		expect(status).toBe(httpStatusCodes.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.BAD_REQUEST,
			code: httpStatusMessages.BAD_REQUEST,
			message: OTP_ALREADY_ENABLED,
		});
	});

	it("should return 403 status code when otp code is expired", async () => {
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
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "123456" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: EXPIRED_OTP,
		});
	});

	it("Should return 403 status code when otp is invalid", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await OtpServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "123456" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: INVALID_OTP,
		});
	});

	it("Should return 403 status code when more than 3 wrong times of sending otp code", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await OtpServices.createOne({ accountId: account._id, hashedOtp });

		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ otp: "123456" });
		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ otp: "123456" });
		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ otp: "123456" });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "123456" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: REACHED_MAXIMUM_WRONG_TRIES,
		});
	});

	it("Should return 422 status code when otp code is not provided", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field is required!`]),
		});
	});

	it("Should return 422 status code when otp code is empty", async () => {
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
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field is required!`]),
		});
	});

	it("Should return 422 status code when otp code is not of type String", async () => {
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
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: 123456 });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "otp"!`]),
		});
	});

	it("Should return 422 status code when otp code is too short", async () => {
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
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "12345" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field should have a length of 6!`]),
		});
	});

	it("Should return 422 status code when otp code is too long", async () => {
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
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "1234567" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field should have a length of 6!`]),
		});
	});
});
