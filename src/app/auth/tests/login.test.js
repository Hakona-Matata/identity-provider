const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const { generate_hash } = require("./../../../src/helpers/hash");

const User = require("./../../../src/app/Models/User.model");

const baseURL = "/auth/login";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Log user In`, () => {
	it("1. Log user In successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: user.email, password: "tesTES@!#1232" });

		expect(status).toBe(200);
		expect(body.data).toHaveProperty("accessToken");
		expect(body.data).toHaveProperty("refreshToken");
	});

	it("2. Email is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ password: "teST12!@" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"email" field is required!'],
		});
	});

	it("3. Password is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "test123@gmail.com" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"password" field is required!'],
		});
	});

	it("4. Email is not a valid email", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "testtesttesttest", password: "tesTT12!@" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"email" field has to be a valid email!'],
		});
	});

	it("5. Email is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "t@test.com", password: "tesTT12!@" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be less than 15 characters!`],
		});
	});

	it("6. Email is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: `${"t".repeat(50)}@test.com`, password: "tesTT12!@" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be more than 40 characers!`],
		});
	});

	it("7. Email is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: 111111111111, password: "tesTT12!@" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"email" field has to be of type string!'],
		});
	});

	it("8. Email can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "", password: "tesTT12!@" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be empty!`],
		});
	});

	it("9. Password can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "test123@gmail.com",
			password: "",
		});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"password" field can't be empty!`],
		});
	});

	it("10. Password is too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "test2312@gmail.com",
			password: "12",
		});

		expect(status).toBe(422);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"password" field can't be less than 8 characters!`,
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
			],
		});
	});

	it("11. Password is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: "teste23@gmail.com",
				password: `${"test".repeat(50)}`,
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"password" field can't be more than 16 characers!`,
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
			],
		});
	});

	it("12. Password is not of string type", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "tests@gmaiol.com",
			password: 23532455,
		});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"password" field has to be of type string!'],
		});
	});

	it("13. Given email is incorrect", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "blabla@gmail.com",
			password: "tesTES@!#1232",
		});

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, email or password are incorrect!",
		});
	});

	it("14. Given password is incorrect", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1233",
		});

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, your email address isn't verified yet!",
		});
	});

	it("15. User email must be verified", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, your email address isn't verified yet!",
		});
	});

	it("16. User account is inactive/ disabled", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, your account is deactivated!",
		});
	});

	it("17. User account is temp deleted", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: user.password,
		});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"password" field can't be more than 16 characers!`,
				'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
			],
		});
	});

	it("18. User account has one 2fa method enabled", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: "Please, check your mailbox for the OTP code",
		});
	});

	it("19. User account has two 2fa method enabled", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: {
				message: "Please, choose one of these security methods!",
				userId: user.id,
				methods: [{ isOTPEnabled: true }, { isSMSEnabled: true }],
			},
		});
	});

	it("20. User account has 3 2fa method enabled", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			isTOTPEnabled: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: {
				message: "Please, choose one of these security methods!",
				userId: user.id,
				methods: [
					{ isOTPEnabled: true },
					{ isSMSEnabled: true },
					{ isTOTPEnabled: true },
				],
			},
		});
	});
});
