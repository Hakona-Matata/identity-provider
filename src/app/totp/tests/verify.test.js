const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index.js");
const {
	FAILURE_MESSAGES: { TOTP_NOT_ENABLED, INVALID_TOTP },
} = require("./../totp.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");
const TotpServices = require("./../totp.services.js");
const { TotpHelper } = require("../../../helpers");

const baseURL = "/auth/account/totp/verify";

describe(`Auth API - Verify TOTP endpoint (during login) "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isTotpEnabled: true,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when TOTP code is verified successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const { plainTextTotpSecret, encryptedTotpSecret } = TotpHelper.generateTotpSecret();

		await TotpServices.createOne({ accountId: account._id, isTemp: false, secret: encryptedTotpSecret });

		const totp = TotpHelper.generateTotpCode(plainTextTotpSecret);

		const { status, body } = await request(app).post(baseURL).send({ accountId: account._id, totp });

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

	it("Should return 403 status code when given accountId is not in our DB", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ accountId: "507f1f77bcf86cd799439011", totp: "123132" });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: TOTP_NOT_ENABLED,
		});
	});

	it("Should return 403 status code when TOTP is not enabled in the given account", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ accountId: "507f1f77bcf86cd799439011", totp: "123132" });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: TOTP_NOT_ENABLED,
		});
	});

	it("Should return 403 status code when TOTP code is invalid", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const { encryptedTotpSecret } = TotpHelper.generateTotpSecret();

		await TotpServices.createOne({ accountId: account._id, isTemp: false, secret: encryptedTotpSecret });

		const { status, body } = await request(app).post(baseURL).send({ accountId: account._id, totp: "123123" });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: INVALID_TOTP,
		});
	});

	it("Should return 422 status code when totp code is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			accountId: "64171cbd792d92b7ed2416b3",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"totp" field is required!`]),
		});
	});

	it("Should return 422 status code when totp code is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ totp: "", accountId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"totp" field is required!`]),
		});
	});

	it("Should return 422 status code when totp code is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: 123123, accountId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "totp"!`]),
		});
	});

	it("Should return 422 status code when totp code is too short", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: "123", accountId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"totp" field should have a length of 6!']),
		});
	});

	it("Should return 422 status code when totp code is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: "123123123", accountId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"totp" field should have a length of 6!']),
		});
	});

	it("Should return 422 status code when accountId field is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ totp: "123123" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"accountId" field is required!']),
		});
	});

	it("Should return 422 status code when accountId field is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ accountId: "", totp: "123123" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"accountId" field is required!']),
		});
	});

	it("Should return 422 status code when accountId field is not a valid mongodb ID", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ accountId: "1".repeat(50), totp: "123123" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['Invalid value for "accountId"!']),
		});
	});
});
