const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const User = require("./../../../src/app/Models/User.model");

const { generate_token } = require("./../../../src/helpers/token");
const { generate_hash } = require("./../../../src/helpers/hash");

const baseURL = "/auth/verify-email";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"GET" ${baseURL} - Verify user email after sign up"`, () => {
	it("1. Email should be verified successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const verificationToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.VERIFICATION_TOKEN_SECRET,
			expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN,
		});

		await User.findByIdAndUpdate(
			{ _id: user._id },
			{ $set: { verificationToken } }
		);

		const { status, body } = await request(app).get(
			`${baseURL}/${verificationToken}`
		);

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: "Your account is verified successfully!",
		});
	});

	it("2. User email is already verified", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const verificationToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.VERIFICATION_TOKEN_SECRET,
			expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN,
		});

		await User.findByIdAndUpdate(
			{ _id: user._id },
			{ $set: { isVerified: true } }
		);

		const { status, body } = await request(app).get(
			`${baseURL}/${verificationToken}`
		);

		expect(status).toBe(STATUS.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: STATUS.BAD_REQUEST,
			code: CODE.BAD_REQUEST,
			message: "Sorry, your account is already verified!",
		});
	});

	it("3. Verify user email route is public", async () => {
		const { status, body } = await request(app).get(baseURL + "/1");

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"verificationToken" param can't be true!`],
		});
	});

	it("4. Verification token isn't provided", async () => {
		const { status, body } = await request(app).get(baseURL + `/`);

		expect(status).toBe(STATUS.NOT_FOUND);
		expect(body).toEqual({
			success: false,
			status: STATUS.NOT_FOUND,
			code: CODE.NOT_FOUND,
			message: "Sorry, this endpoint is not found!",
		});
	});

	it("5. Verification token isn't string", async () => {
		const { status, body } = await request(app).get(baseURL + `/` + 1);

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"verificationToken" param can't be true!`],
		});
	});

	it("6. Verification token is too short to be true", async () => {
		const { status, body } = await request(app).get(baseURL + `/12`);

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"verificationToken" param can't be true!`],
		});
	});

	it("7. Verification token is too long to be true", async () => {
		const { status, body } = await request(app).get(
			baseURL + `/${"blabla".repeat(50)}`
		);
		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"verificationToken" param can't be true!`],
		});
	});
});
