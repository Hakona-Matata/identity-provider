const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants");
const {
	SUCCESS_MESSAGES: { OTP_SENT_SUCCESSFULLY },
	FAILURE_MESSAGES: { OTP_ALREADY_ENABLED, ALREADY_HAVE_VALID_OTP },
} = require("./../otp.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");

const baseURL = "/auth/account/otp/enable";

describe(`Auth API - Enable OTP endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code when OTP feature is enabled successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).get(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: OTP_SENT_SUCCESSFULLY,
		});
	});

	it("Should return 400 status code when OTP feature is already enabled", async () => {
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

		const { status, body } = await request(app).get(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.BAD_REQUEST,
			code: httpStatusCodeStrings.BAD_REQUEST,
			message: OTP_ALREADY_ENABLED,
		});
	});

	it("Should return 403 status code when OTP feature is already initiated", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await request(app).get(baseURL).set("Authorization", `Bearer ${accessToken}`);
		const { status, body } = await request(app).get(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: ALREADY_HAVE_VALID_OTP,
		});
	});

	it("Should return 404 status code when accessToken is not provided", async () => {
		const { status, body } = await request(app).get(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.NOT_FOUND);

		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.NOT_FOUND,
			code: httpStatusCodeStrings.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});
});
