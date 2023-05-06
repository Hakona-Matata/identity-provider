const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { ACCOUNT_RESET_SUCCESSFULLY },
	FAILURE_MESSAGES: { ALREADY_RESET_ACCOUNT },
} = require("./../password.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services.js");

const { TokenHelper } = require("../../../../shared/helpers");

const baseURL = "/auth/account/password/reset";

describe(`Identity Provider API - Reset password endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code when account reset is done successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const resetToken = await TokenHelper.generateResetToken({
			accountId: account._id,
			role: account.role,
		});

		await AccountServices.updateOne({ _id: account._id }, { resetToken });

		const { status, body } = await request(app).put(baseURL).send({
			resetToken,
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: ACCOUNT_RESET_SUCCESSFULLY,
		});
	});

	it("Should return 403 status code when reset token is already used", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const resetToken = await TokenHelper.generateResetToken({
			accountId: account._id,
			role: account.role,
		});

		await AccountServices.updateOne({ _id: account._id }, { resetToken });

		await request(app).put(baseURL).send({
			resetToken,
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		const { status, body } = await request(app).put(baseURL).send({
			resetToken,
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: ALREADY_RESET_ACCOUNT,
		});
	});

	it("Should return 422 status code when reset token is not provided", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"resetToken" field is required!`]),
		});
	});

	it("Should return 422 status code when reset token is empty", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: "",
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"resetToken" field is required!`]),
		});
	});

	it("Should return 422 status code when reset token is not of type string", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: 234532,
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "resetToken"!`]),
		});
	});

	it("Should return 422 status code when reset token is too short", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: "12",
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"resetToken" field should have a minimum length of 64!`]),
		});
	});

	it("Should return 422 status code when reset token is too long", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(200),
				password: "tesTE!@12",
				confirmPassword: "tesTE!@12",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"resetToken" field should have a maximum length of 300!`]),
		});
	});

	it("Should return 422 status code when password and confirmPassword fields don't match", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "tesTE!@12",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"confirmPassword" field must match "password" field!`]),
		});
	});

	it("Should return 422 status code when password field is empty", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"password" field is required!`,
				`"confirmPassword" field must match "password" field!`,
			]),
		});
	});

	it("Should return 422 status code when password field is not provided", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),

				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"password" field is required!',
				`"confirmPassword" field must match "password" field!`,
			]),
		});
	});

	it("Should return 422 status code when password field is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: 123423423,
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`Invalid type, expected a string for "password"!`,
				`"confirmPassword" field must match "password" field!`,
			]),
		});
	});

	it("Should return 422 status code when password field is too short", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "123",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters`,
				`"confirmPassword" field must match "password" field!`,
			]),
		});
	});

	it("Should return 422 status code when password field is too long", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "123".repeat(100),
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters`,
				`"confirmPassword" field must match "password" field!`,
			]),
		});
	});

	it("Should return 422 status code when confirmPassword field is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "teST12!@",
				confirmPassword: 123423423423,
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"confirmPassword" field must match "password" field!`,
				`Invalid type, expected a string for "confirmPassword"!`,
			]),
		});
	});
});
