const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { ACCOUNT_VERIFIED_SUCCESSFULLY },
	FAILURE_MESSAGES: { ACCOUNT_ALREADY_VERIFIED },
} = require("./../auth.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services");
const { TokenHelper } = require("../../../../shared/helpers");

const baseURL = "/auth/verify-email";

describe(`Identity Provider API - verify account endpoint ${baseURL}"`, () => {
	it("Should return 200 status code and successfully verify user email", async () => {
		const { _id, role } = await AccountServices.createOne({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		});

		const verificationToken = await TokenHelper.generateVerificationToken({
			accountId: _id,
			role,
		});

		const { status, body } = await request(app).get(`${baseURL}/${verificationToken}`);

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: ACCOUNT_VERIFIED_SUCCESSFULLY,
		});
	});

	it("Should return 400 status code when user email is already verified", async () => {
		const { _id, role } = await AccountServices.createOne({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		});

		const verificationToken = await TokenHelper.generateVerificationToken({
			accountId: _id,
			role,
		});

		await request(app).get(`${baseURL}/${verificationToken}`);

		const { status, body } = await request(app).get(`${baseURL}/${verificationToken}`);

		expect(status).toBe(httpStatusCodes.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.BAD_REQUEST,
			code: httpStatusMessages.BAD_REQUEST,
			message: ACCOUNT_ALREADY_VERIFIED,
		});
	});

	it("Should be public endpoint", async () => {
		const { status, body } = await request(app).get(baseURL + "/1");

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"verificationToken" field should have a minimum length of 64!']),
		});
	});
});
