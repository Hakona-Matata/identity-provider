const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");
const {
	SUCCESS_MESSAGES: { PASSWORD_CHANGED_SUCCESSFULLY },
	FAILURE_MESSAGES: { INCORRECT_PASSWORD },
} = require("./../password.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { app } = require("../../../../core/app");

const AccountServices = require("./../../account/account.services");

const baseURL = "/auth/account/password/change";

describe(`Identity Provider API - Change password endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code when user changes his password successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: fakeAccount.password,
			password: "tesTES@!#1212",
			confirmPassword: "tesTES@!#1212",
		});

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: PASSWORD_CHANGED_SUCCESSFULLY,
		});
	});

	it("Should return 403 status code when given password is wrong", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "tesTES@!#34",
			password: "tesTES@!#1212",
			confirmPassword: "tesTES@!#1212",
		});

		expect(status).toBe(httpStatusCodes.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.FORBIDDEN,
			code: httpStatusMessages.FORBIDDEN,
			message: INCORRECT_PASSWORD,
		});
	});

	it("Should return 422 status code when the password and passwordConfirm don't match", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "tesTES@!#12",
			password: "tesTES@!#12",
			confirmPassword: "tesTES@!#234",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"confirmPassword" field must match "password" field!`]),
		});
	});

	it("Should return 422 status code when no inputs are provided at all", async () => {
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

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"oldPassword" field is required!',
				'"password" field is required!',
				'"confirmPassword" field is required!',
			]),
		});
	});

	it("Should return 422 status code when oldPassword field is not of type string", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: 1234234,
			password: "tesTES@!#12",
			confirmPassword: "tesTES@!#12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: ['Invalid type, expected a string for "oldPassword"!'],
		});
	});

	it("Should return 422 status code when oldPassword field is too short", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "12",
			password: "tesTES@!#12",
			confirmPassword: "tesTES@!#12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters`,
			]),
		});
	});

	it("Should return 422 status code when oldPassword field is too long", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "12".repeat(100),
				password: "tesTES@!#12",
				confirmPassword: "tesTES@!#12",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters',
			]),
		});
	});

	it("Should return 422 status code when oldPassword field is empty", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "",
			password: "tesTES@!#12",
			confirmPassword: "tesTES@!#12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"oldPassword" field is required!']),
		});
	});

	it("Should return 422 status code when oldPassword field pattern is invalid", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "tttttttttt",
			password: "tesTES@!#12",
			confirmPassword: "tesTES@!#12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters',
			]),
		});
	});

	it("Should return 422 status code when password field is not of type string", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "tesTES@!#12",
			password: 1234234,
			confirmPassword: "tesTES@!#12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'Invalid type, expected a string for "password"!',
				'"confirmPassword" field must match "password" field!',
			]),
		});
	});

	it("Should return 422 status code when password field is too short", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "tesTES@!#12",
			password: "12",
			confirmPassword: "tesTES@!#12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters',
				'"confirmPassword" field must match "password" field!',
			]),
		});
	});

	it("Should return 422 status code when Password field is too long", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				password: "1".repeat(100),
				confirmPassword: "tesTES@!#12",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters',
				'"confirmPassword" field must match "password" field!',
			]),
		});
	});

	it("Should return 422 status code when password field is empty", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "tesTES@!#12",
			password: "",
			confirmPassword: "tesTES@!#12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"password" field is required!',
				'"confirmPassword" field must match "password" field!',
			]),
		});
	});

	it("Should return 422 status code when password doesn't follow the right pattern", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app).put(baseURL).set("Authorization", `Bearer ${accessToken}`).send({
			oldPassword: "tesTES@!#12",
			password: "testtest",
			confirmPassword: "tesTES@!#12",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters) and (8-16) characters',
				'"confirmPassword" field must match "password" field!',
			]),
		});
	});
});
