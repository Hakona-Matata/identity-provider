const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const User = require("./../../../src/app/Models/User.model");

const { generate_hash } = require("./../../../src/helpers/hash");

const baseURL = "/auth/account/delete";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"DELETE" ${baseURL} - Delete User Account`, () => {
	it("1. Delete user account successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		const { status, body } = await request(app)
			.delete(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: "Your account Will be deleted permenantly in 30 days, unless you cancelled the deletion later!",
		});
	});

	it("2. Account is already deleted", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		const { status, body } = await request(app)
			.delete(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.FORBIDDEN);
	});

	it("3. Account deletion route is private", async () => {
		const { status, body } = await request(app).delete(baseURL);

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, the access token is required!",
		});
	});
});
