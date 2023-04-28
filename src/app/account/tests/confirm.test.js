const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index.js");
const {
	SUCCESS_MESSAGES: { ACTIVATED_SUCCESSFULLY },
	FAILURE_MESSAGES: { ACCOUNT_ALREADY_ACTIVE, ACCOUNT_NEED_TO_BE_VERIFIED },
} = require("./../account.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { app } = require("../../../app");

const AccountServices = require("./../account.services.js");
const TokenHelper = require("../../../helpers/tokenHelper.js");

const baseURL = "/auth/account/activate";

describe(`Auth API - confirm account activation endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code when account activation succeeds", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const activationToken = await TokenHelper.generateActivationToken({
			accountId: account.id,
			role: account.role,
		});

		await AccountServices.updateOne({ _id: account._id }, { activationToken });

		await request(app).put(baseURL).send({ email: account.email });

		const { status, body } = await request(app).get(`${baseURL}/${activationToken}`);

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: ACTIVATED_SUCCESSFULLY,
		});
	});

	it("Should return 403 status code when account activation is already confirmed", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isActive: true,
		});

		const activationToken = await TokenHelper.generateActivationToken({
			accountId: account._id,
			role: account.role,
		});

		await AccountServices.updateOne({ _id: account._id }, { activationToken });

		await request(app).put(baseURL).send({ email: account.email }); //

		await request(app).get(`${baseURL}/${activationToken}`);
		const { status, body } = await request(app).get(`${baseURL}/${activationToken}`);

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: ACCOUNT_ALREADY_ACTIVE,
		});
	});

	it("Should return 403 status code when account email is not verified ", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isVerified: false,
			isActive: false,
		});

		const activationToken = await TokenHelper.generateActivationToken({
			accountId: account._id,
			role: account.role,
		});

		await AccountServices.updateOne({ _id: account._id }, { activationToken });

		await request(app).put(baseURL).send({ email: account.email });

		const { status, body } = await request(app).get(`${baseURL}/${activationToken}`);

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: ACCOUNT_NEED_TO_BE_VERIFIED,
		});
	});

	it("Should return 403 status code when account is temp deleted", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isVerified: true,
			isDeleted: true,
		});

		const activationToken = await TokenHelper.generateActivationToken({
			accountId: account._id,
			role: account.role,
		});

		await AccountServices.updateOne({ _id: account._id }, { activationToken });

		await request(app).put(baseURL).send({ email: account.email });

		const { status } = await request(app).get(`${baseURL}/${activationToken}`);

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
	});

	it("Should return 403 status code when verification token is invalid", async () => {
		const { status, body } = await request(app).get(`${baseURL}/${"te".repeat(100)}`);
		console.log({ body });
		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: "Sorry, the given token is invalid!",
		});
	});

	it("Should return 422 status code when verification token is too short", async () => {
		const { status, body } = await request(app).get(`${baseURL}/${12}`);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"activationToken" field should have a minimum length of 64!`]),
		});
	});

	it("Should return 422 status code when verification token is too short", async () => {
		const { status, body } = await request(app).get(`${baseURL}/${"t".repeat(500)}`);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"activationToken" field should have a maximum length of 300!`]),
		});
	});
});
