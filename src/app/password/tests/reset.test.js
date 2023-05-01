const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index.js");
const {
	SUCCESS_MESSAGES: { ACCOUNT_RESET_SUCCESSFULLY },
	FAILURE_MESSAGES: { ALREADY_RESET_ACCOUNT },
} = require("./../password.constants.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services.js");
const TokenHelper = require("../../../helpers/tokenHelper.js");

const baseURL = "/auth/account/password/reset";

describe(`Auth API - Reset password endpoint "${baseURL}"`, () => {
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

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
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

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: ALREADY_RESET_ACCOUNT,
		});
	});

	//==============================================================

	it("3. Reset token is not provided", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"resetToken" param is required!`],
		});
	});

	it("4. Reset token can't be empty", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: "",
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"resetToken" param can't be empty!`],
		});
	});

	it("5. Reset token is not of type string", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: 234532,
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"resetToken" param has to be of type string!`],
		});
	});

	it("6. Reset token is too short to be true", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: "12",
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"resetToken" param can't be true!`],
		});
	});

	it("7. Reset token is too long to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(200),
				password: "tesTE!@12",
				confirmPassword: "tesTE!@12",
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"resetToken" param can't be true!`],
		});
	});

	//==============================================================
	it("8. password and confirmPassword fields don't match", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "tesTE!@12",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"confirmPassword" field doesn't match "password" field`],
		});
	});

	//==============================================================

	it("9. password field can't be empty", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"password" field can't be empty!`, `"confirmPassword" field doesn't match "password" field`],
		});
	});

	it("10. password field is not provided", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),

				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: ['"password" field is required!', `"confirmPassword" field doesn't match "password" field`],
		});
	});

	it("11. password field is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: 123423423,
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: ['"password" field has to be of type string!', `"confirmPassword" field doesn't match "password" field`],
		});
	});

	it("12. password field is too short to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "123",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [
				`"password" field can't be less than 8 characters!`,
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
				`"confirmPassword" field doesn't match "password" field`,
			],
		});
	});

	it("13. password field is too long to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "123".repeat(100),
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [
				`"password" field can't be more than 16 characers!`,
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
				`"confirmPassword" field doesn't match "password" field`,
			],
		});
	});
	//==============================================================

	it("14. confirmPassowrd is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "teST12!@",
				confirmPassword: 123423423423,
			});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"confirmPassword" field doesn't match "password" field`, '"confirmPassword" must be a string'],
		});
	});
});
