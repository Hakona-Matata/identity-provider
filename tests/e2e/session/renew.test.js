const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");

const baseURL = "/auth/sessions/renew";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Renew User Session`, () => {
	it("1. Renew user session successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get the needed tokens
		const {
			body: {
				data: { refreshToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Renew user session
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ refreshToken });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body).toHaveProperty("data.accessToken");
		expect(body).toHaveProperty("data.refreshToken");
	});
});
