const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	FAILURE_MESSAGES: { NEED_TO_HAVE_GENERATED },
} = require("../backup.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services");

const baseURL = "/auth/account/backup/regenerate";

describe(`Identity Provider API - Regenerate Backup codes endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code when regenerate new backup codes is done successfully", async () => {
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

		const {
			body: {
				result: { codes },
			},
		} = await request(app).post("/auth/account/backup/initiate").set("Authorization", `Bearer ${accessToken}`);

		await request(app)
			.post("/auth/account/backup/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: codes[0] });

		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodes.OK);
		expect(body.result.codes).toHaveLength(10);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: {
				codes: expect.arrayContaining([expect.any(String)]),
			},
		});
	});

	it("Should return 403 status code when there are no previously generated ones", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isOtpEnabled: true, isBackupEnabled: true });

		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: NEED_TO_HAVE_GENERATED,
		});
	});

	it("Should return 404 status code when access token is not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodes.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.NOT_FOUND,
			code: httpStatusMessages.NOT_FOUND,
			message: "Sorry, the access token is not found!",
		});
	});
});
