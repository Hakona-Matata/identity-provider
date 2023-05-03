const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants");
const {
	SUCCESS_MESSAGES: { SMS_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: { ALREADY_DISABLED_SMS },
} = require("./../sms.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");

const baseURL = "/auth/account/sms/disable";

describe(`Auth API - Disable SMS endpoint"${baseURL}"`, () => {
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

	it("Should return 200 status code when disable SMS feature successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isSmsEnabled: true });

		const { status, body } = await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: SMS_DISABLED_SUCCESSFULLY,
		});
	});

	it("Should return 400 status code when SMS feature is already enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isSmsEnabled: true });

		await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.BAD_REQUEST,
			code: httpStatusCodeStrings.BAD_REQUEST,
			message: ALREADY_DISABLED_SMS,
		});
	});

	it("Should return 404 status code when accessToken is not found", async () => {
		const { status, body } = await request(app).delete(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.NOT_FOUND,
			code: httpStatusCodeStrings.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});
});
