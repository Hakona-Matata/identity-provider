const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services.js");

const baseURL = "/auth/account/sessions/";

describe(`Identity Provider API - Find all sessions endpoint "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when returns all found sessions successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).get(baseURL).set("authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: expect.arrayContaining([expect.anything(), expect.anything()]),
		});
	});

	it("Should return 404 status code when access token is not provided", async () => {
		const { status, body } = await request(app).get(baseURL);

		expect(status).toBe(httpStatusCodes.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.NOT_FOUND,
			code: httpStatusMessages.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});
});
