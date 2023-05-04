const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index.js");
const {
	SUCCESS_MESSAGES: { TOTP_DISABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: { TOTP_ALREADY_DISABLED },
} = require("./../totp.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");
const TotpServices = require("../totp.services.js");

const baseURL = "/auth/account/totp/disable";

describe(`Auth API - Disable TOTP endpoint "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isTotpEnabled: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when TOTP is disabled successfully", async () => {
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
		await TotpServices.createOne({ accountId: account._id, isTemp: false, secret: "test" });

		const { status, body } = await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: TOTP_DISABLED_SUCCESSFULLY,
		});
	});

	it("Should return 400 status code when TOTP is already disabled", async () => {
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
		await TotpServices.createOne({ accountId: account._id, isTemp: false, secret: "test" });

		await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);
		const { status, body } = await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.BAD_REQUEST,
			code: httpStatusCodeStrings.BAD_REQUEST,
			message: TOTP_ALREADY_DISABLED,
		});
	});

	it("Should return 404 status code when access token is not found", async () => {
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
