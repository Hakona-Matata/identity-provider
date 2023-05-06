const { httpStatusMessages, httpStatusCodes } = require("./../../../../shared/constants/http");

const {
	SUCCESS_MESSAGES: { SIGN_UP_SUCCESSFULLY },
} = require("./../auth.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { app } = require("../../../../core/app");

const baseURL = "/auth/sign-up";

describe(`Identity Provider API - Sign up endpoint ${baseURL}`, () => {
	const fakeUser = {
		email: faker.internet.email(),
		userName: faker.random.alpha(10),
		role: "CANDIDATE",
		password: "teTE!@12",
		confirmPassword: "teTE!@12",
	};

	it("Should return 200 status code and create a new user successfully", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
			});

		expect(status).toBe(httpStatusCodes.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodes.OK,
			code: httpStatusMessages.OK,
			result: SIGN_UP_SUCCESSFULLY,
		});
	});

	it("Should return 422 status code for duplicate username", async () => {
		await request(app)
			.post(baseURL)
			.send({ ...fakeUser });

		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
				email: faker.internet.email(),
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: "Sorry, the userName may be already taken!",
		});
	});

	it("Should return 422 status code for duplicate email", async () => {
		await request(app)
			.post(baseURL)
			.send({ ...fakeUser });

		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
				userName: faker.random.alpha(10),
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: "Sorry, the email may be already taken!",
		});
	});

	it("Should return 422 status code for mismatched passwords", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
				confirmPassword: "teTE!@121",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`"confirmPassword" field must match "password" field!`]),
		});
	});

	it("Should return an error with status 422 when no user inputs are provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				`"email" field is required!`,
				`"userName" field is required!`,
				`"password" field is required!`,
				`"confirmPassword" field is required!`,
				`"role" field is required!`,
			]),
		});
	});

	it("Should return an error with status 422 when userName is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: faker.internet.email(),
			password: "teTE!@12",
			confirmPassword: "teTE!@13",
		});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"userName" field is required!',
				`"confirmPassword" field must match "password" field!`,
				`"role" field is required!`,
			]),
		});
	});

	it("Should return an error with status 422 when email is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				userName: faker.random.alpha(10),
				password: "teTE!@12",
				confirmPassword: "teTE!@13",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"email" field is required!',
				`"confirmPassword" field must match "password" field!`,
			]),
		});
	});

	it("Should return an error with status 422 when password is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: faker.internet.email(),
				userName: faker.random.alpha(10),
				confirmPassword: "teTE!@13",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([
				'"password" field is required!',
				`"confirmPassword" field must match "password" field!`,
				'"role" field is required!',
			]),
		});
	});

	it("Should return an error with status 422 when confirmPassword is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: faker.internet.email(),
				userName: faker.random.alpha(10),
				password: "teTE!@13",
			});

		expect(status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodes.UNPROCESSABLE_ENTITY,
			code: httpStatusMessages.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"confirmPassword" field is required!', '"role" field is required!']),
		});
	});
});
