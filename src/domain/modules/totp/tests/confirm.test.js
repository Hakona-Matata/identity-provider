const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { TOTP_ENABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: { INVALID_TOTP, START_FROM_SCRATCH, TOTP_ALREADY_ENABLED, TOTP_ALREADY_CONFIRMED },
} = require("./../totp.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services.js");
const TotpServices = require("../totp.services.js");

const { TotpHelper } = require("./../../../../shared/helpers");

const baseURL = "/auth/account/totp/confirm";

describe(`Identity Provider API - Confirm enabling TOTP endpoint "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when confirm enabling TOTP is done successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const {
			body: {
				result: { secret },
			},
		} = await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		const generatedTotp = TotpHelper.generateTotpCode(secret);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: generatedTotp.toString() });

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: TOTP_ENABLED_SUCCESSFULLY,
		});
	});

	it("Should return 400 status code when TOTP feature is already enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isTotpEnabled: true });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		expect(status).toBe(httpStatusCodes.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.BAD_REQUEST,
			code: httpStatusMessages.BAD_REQUEST,
			message: TOTP_ALREADY_ENABLED,
		});
	});

	it("Should return 403 status code when TOTP code is expired", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const {
			body: {
				result: { secret },
			},
		} = await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		const generatedTotp = TotpHelper.generateTotpCode(secret);

		await new Promise((resolve) => setTimeout(resolve, 70000));

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: generatedTotp.toString() });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: INVALID_TOTP,
		});
	});

	it("Should return 403 status code when TOTP code is invalid", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: INVALID_TOTP,
		});
	});

	it("Should return 403 status code when TOTP sent 3 times wrong", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ totp: "123123" });
		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ totp: "123123" });
		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`).send({ totp: "123123" });
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: START_FROM_SCRATCH,
		});
	});

	it("Should return 403 status code when TOTP isn't initiated", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		await TotpServices.updateOne({ accountId: account._id }, { isTemp: false });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: TOTP_ALREADY_CONFIRMED,
		});
	});

	it("Should return 404 status code when access token is not found", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodes.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.NOT_FOUND,
			code: httpStatusMessages.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});

	it("Should return 422 status code when totp code is not provided", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"totp" field is required!`]),
		});
	});

	it("Should return 422 status code when totp code is not of type string", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: 123456 });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "totp"!`]),
		});
	});

	it("Should return 422 status code when totp code is too short", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"totp" field should have a length of 6!`]),
		});
	});

	it("Should return 422 status code when totp code is too long", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).post("/auth/account/totp/enable").set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123123" });

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"totp" field should have a length of 6!`]),
		});
	});
});
