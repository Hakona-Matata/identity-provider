const httpStatusCodeNumbers = require("./../../../src/constants/statusCodes");
const httpStatusCodeNumbers = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const User = require("../../../src/app/Models/User.model");

const { generate_hash } = require("../../../src/helpers/hash");
const { generate_token } = require("../../../src/helpers/token");

const baseURL = "/auth/account/activate";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"GET" ${baseURL} - Confirm activate User Account`, () => {
	it("1. Activate user account successfully", async () => {
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

		await request(app).put(baseURL).send({ email: user.email });

		const { status, body } = await request(app).get(
			`${baseURL}/${activationToken}`
		);

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			data: "Account is activated successfully",
		});
	});

	it("2. User already confirmed account activation", async () => {
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

		await request(app).put(baseURL).send({ email: user.email });

		await request(app).get(`${baseURL}/${activationToken}`);
		const { status, body } = await request(app).get(
			`${baseURL}/${activationToken}`
		);

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: "Sorry, your account is already active!",
		});
	});

	it("3. User account is not verified yet", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
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

		await request(app).put(baseURL).send({ email: user.email });

		const { status, body } = await request(app).get(
			`${baseURL}/${activationToken}`
		);

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: "Sorry, your email address isn't verified yet!",
		});
	});

	it("4. User account is temp deleted", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isDeleted: true,
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

		await request(app).put(baseURL).send({ email: user.email });

		const { status, body } = await request(app).get(
			`${baseURL}/${activationToken}`
		);

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
	});

	it("5. Verification token is invalid", async () => {
		const { status, body } = await request(app).get(
			`${baseURL}/${"te".repeat(100)}`
		);

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: "Sorry, the access token is invalid!",
		});
	});

	it("6. Verification token is expired", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isDeleted: true,
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

		await request(app).put(baseURL).send({ email: user.email });

		const { status, body } = await request(app).get(
			`${baseURL}/${activationToken}`
		);

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: `Sorry, your token is expired!`,
		});
	});

	it("7. Confirm verification token route is public", async () => {
		const { status, body } = await request(app).get(`${baseURL}/`);

		expect(status).toBe(httpStatusCodeNumbers.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.NOT_FOUND,
			code: httpStatusCodeStrings.NOT_FOUND,
			message: "Sorry, this endpoint is not found!",
		});
	});

	it("8. No verificationToken is provided ", async () => {
		const { status, body } = await request(app).get(`${baseURL}/`);

		expect(status).toBe(httpStatusCodeNumbers.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.NOT_FOUND,
			code: httpStatusCodeStrings.NOT_FOUND,
			message: "Sorry, this endpoint is not found!",
		});
	});

	it("9. Provided verificationToken is too short to be true", async () => {
		const { status, body } = await request(app).get(`${baseURL}/${12}`);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"activationToken" param can't be true!`],
		});
	});

	it("10. Provided verificationToken is too long to be true", async () => {
		const { status, body } = await request(app).get(
			`${baseURL}/${"t".repeat(500)}`
		);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"activationToken" param can't be true!`],
		});
	});
});
