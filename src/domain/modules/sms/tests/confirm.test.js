const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { SMS_ENABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: { EXPIRED_SMS, INVALID_OTP, REACHED_MAXIMUM_WRONG_TRIES },
} = require("./../sms.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services");
const SmsServices = require("./../sms.services");

const { RandomGenerator, HashHelper } = require("./../../../../shared/helpers");

const baseURL = "/auth/account/sms/confirm";

describe(`Identity Provider API - Confirm enabling OTP over SMS endpoint"${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			phone: "+201210101010",
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when confirm enabling SMS is done successfully", async () => {
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
		await SmsServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: plainTextOtp.toString() });

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: SMS_ENABLED_SUCCESSFULLY,
		});
	});

	it("Should return 403 status code when otp code is expired", async () => {
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
			.send({ otp: "234234" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: EXPIRED_SMS,
		});
	});

	it("Should return 403 status code when otp code is invalid", async () => {
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
		await SmsServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "234234" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: INVALID_OTP,
		});
	});

	it("Should return 403 status code when otp code is sent 3 times wrong", async () => {
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
		await SmsServices.createOne({ accountId: account._id, hashedOtp });

		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ otp: "234234" });
		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ otp: "234234" });
		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ otp: "234234" });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "234234" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: REACHED_MAXIMUM_WRONG_TRIES,
		});
	});

	it("Should return 404 status code when the accessToken is not found", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodes.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.NOT_FOUND,
			code: httpStatusMessages.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});

	it("Should return 422 status when otp code field is not provided", async () => {
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
			message: expect.arrayContaining(['"otp" field is required!']),
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
			message: expect.arrayContaining(['"otp" field is required!']),
		});
	});

	it("Should return 422 status code when otp code it not of type string", async () => {
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
			.send({ otp: "123123123" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field should have a length of 6!`]),
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
			.send({ otp: "123" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"otp" field should have a length of 6!`]),
		});
	});
});
