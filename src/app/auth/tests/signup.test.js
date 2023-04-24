const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { app } = require("../../../server");
const { httpStatusCodeStrings, httpStatusCodeNumbers } = require("./../../../constants/index");

const baseURL = "/auth/sign-up";

const fakeUser = {
	email: faker.internet.email(),
	userName: faker.random.alpha(10),
	role: "CANDIDATE",
	password: "teTE!@12",
	confirmPassword: "teTE!@12",
};

describe(`Auth API - Sign up endpoint ${baseURL}"`, () => {
	it.only(`Should create a new user successfully`, async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
			});

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			data: "Please, check your mailbox to verify your email address!",
		});
	});

	it(`2. Duplicate userName`, async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
				email: faker.internet.email(),
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: "Sorry, this userName may be already taken!",
		});
	});

	it("3. Duplicate email", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				...fakeUser,
				userName: faker.random.alpha(10),
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: "Sorry, this email may be already taken!",
		});
	});

	it("4. Passwords don't match", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: faker.internet.email(),
				userName: faker.random.alpha(10),
				password: "teTE!@12",
				confirmPassword: "teTE!@13",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"confirmPassword" field doesn't match "password" field`],
		});
	});

	it("5. No user inputs provided at all", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				'"email" field is required!',
				'"userName" field is required!',
				'"password" field is required!',
				'"confirmPassword" is required',
			],
		});
	});

	it("6. userName is not found", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: faker.internet.email(),
			password: "teTE!@12",
			confirmPassword: "teTE!@13",
		});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"userName" field is required!', `"confirmPassword" field doesn't match "password" field`],
		});
	});

	it("7. email is not found", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				userName: faker.random.alpha(10),
				password: "teTE!@12",
				confirmPassword: "teTE!@13",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"email" field is required!', `"confirmPassword" field doesn't match "password" field`],
		});
	});

	it("8. password is not found", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: faker.internet.email(),
				userName: faker.random.alpha(10),
				confirmPassword: "teTE!@13",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"password" field is required!', `"confirmPassword" field doesn't match "password" field`],
		});
	});

	it("9. confirmPassword is not found", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: faker.internet.email(),
				userName: faker.random.alpha(10),
				password: "teTE!@13",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"confirmPassword" is required'],
		});
	});
});
