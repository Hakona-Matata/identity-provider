const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { DEACTIVATED_SUCCESSFULLY },
} = require("./../account.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { app } = require("../../../../core/app");

const AccountServices = require("./../account.services.js");

const baseURL = "/auth/account/deactivate";

describe(`Identity Provider API - Deactivate account endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status when deactivates account successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: DEACTIVATED_SUCCESSFULLY,
		});
	});

	it(`Should return 403 status code when account is already deactivated`, async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
			isActive: false,
		});

		const { status, body } = await request(app)
			.post("/auth/login")
			.send({ email: account.email, password: fakeAccount.password });

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: "Sorry, your account is currently deactivated!",
		});
	});

	it(`Should return 404 status code when no access token is found`, async () => {
		const { status, body } = await request(app).put(baseURL);

		expect(status).toBe(httpStatusCodes.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.NOT_FOUND,
			code: httpStatusMessages.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});
});
