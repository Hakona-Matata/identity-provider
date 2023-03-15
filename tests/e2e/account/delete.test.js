const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const User = require("./../../../src/app/Models/User.model");

const { generate_hash } = require("./../../../src/helpers/hash");
const { generate_token } = require("./../../../src/helpers/token");

const baseURL = "/auth/account/delete";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"GET" ${baseURL} - Delete User Account`, () => {
	it("1. Delete user account successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Log user out!
		const { status, body } = await request(app)
			.delete(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (5) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe(
			"Account deleted successfully!\n(It Will be deleted permenantly after 30 days)"
		);
	});

	it("2. Account is already deleted", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Log user out!
		const { status, body } = await request(app)
			.delete(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (5) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your account is deleted!");
	});
});
