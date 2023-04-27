const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../../constants/index");
const {
	SUCCESS_MESSAGES: { LOGGED_OUT_SUCCESSFULLY },
} = require("./../auth.constants");
const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("./../../../app");

const AccountServices = require("../../account/account.services");

const baseURL = "/auth/logout";

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

describe(`Auth API - Log Out endpoint ${baseURL}"`, () => {
	it("Should return 200 status code when account is logged out successfully", async () => {
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

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: LOGGED_OUT_SUCCESSFULLY,
		});
	});

	it("Should return 401 status code when no accessToken is provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.NOT_FOUND,
			code: httpStatusCodeStrings.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});

	it("Should return 401 status code when the access token is not valid", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.set(
				"authorization",
				"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
			);

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: "Sorry, the given token is invalid!",
		});
	});
});
