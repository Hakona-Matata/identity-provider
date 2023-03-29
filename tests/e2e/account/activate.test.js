const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const User = require("./../../../src/app/Models/User.model");

const { generate_hash } = require("./../../../src/helpers/hash");
const { generate_token } = require("./../../../src/helpers/token");

const baseURL = "/auth/account/activate";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"PUT" ${baseURL} - Initiate User Account Activation`, () => {
	it("1. Initiate user account activation successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		expect(status).toBe(200);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data:
				"Please, check your mailbox to confirm your account activation\n" +
				"You only have 1h",
		});
	});

	it("2. Provided email is not found in our DB", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "blasfasdf@gma.com" });

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data:
				"Please, check your mailbox to confirm your account activation\n" +
				"You only have 1h",
		});
	});

	it("3. User account must be verified before initiating activation", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		expect(status).toBe(STATUS.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, your email address isn't verified yet!",
		});
	});

	it("4 .User account can't be temp deleted before initiating activation", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			isDeleted: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		expect(status).toBe(STATUS.FORBIDDEN);
	});

	it("5. User account is already active", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		expect(status).toBe(STATUS.FORBIDDEN);

		expect(status).toBe(STATUS.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, your account is already active!",
		});
	});

	it("6. User account is already initiated account activation", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const activationToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.ACTIVATION_TOKEN_SECRET,
			expiresIn: process.env.ACTIVATION_TOKEN_EXPIRES_IN,
		});

		await User.findOneAndUpdate(
			{ _id: user._id },
			{ $set: { activationToken } }
		);

		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		expect(status).toBe(STATUS.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, you still have a valid link in your mailbox!",
		});
	});

	it("7. User have a an expired verification token in his mailbox", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const activationToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.ACTIVATION_TOKEN_SECRET,
			expiresIn: 1,
		});

		await User.findOneAndUpdate(
			{ _id: user._id },
			{ $set: { activationToken } }
		);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: user.email });

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, your token is expired!",
		});
	});

	it("8. Activate user account route is public", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "test2332@gmail.com" });

		expect(status).toBe(200);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data:
				"Please, check your mailbox to confirm your account activation\n" +
				"You only have 1h",
		});
	});

	it("9. email field is provided", async () => {
		const { status, body } = await request(app).put(baseURL);

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"email" field is required!`],
		});
	});

	it("10. Provided email is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: 1234324 });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"email" field has to be of type string!'],
		});
	});

	it("11. Provided email is not a valid email", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "testsetsesttesttest" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"email" field has to be a valid email!`],
		});
	});

	it("12. Provided email is too short to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "test" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"email" field can't be less than 15 characters!`,
				`"email" field has to be a valid email!`,
			],
		});
	});

	it("13. Provided email is too long to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "test".repeat(50) });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"email" field can't be more than 40 characers!`,
				`"email" field has to be a valid email!`,
			],
		});
	});

	it("14. Provided email can't be empty", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be empty!`],
		});
	});
});
