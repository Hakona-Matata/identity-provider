const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const { generate_hash } = require("./../../../src/helpers/hash");

const User = require("./../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");

const baseURL = "/auth/logout";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Log user out`, () => {
	it("1. it should log user out successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
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
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send();

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken: body.data.accessToken,
		});

		// (5) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("Logged out successfully");
	});

	it("2. No accessToken is provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you need to pass the needed tokens!");
	});

	it("3. Malformed accessToken", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", "Bearer test");

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your token is malformed!");
	});

	it("4. Invalid accessToken", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.set(
				"authorization",
				`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
			);

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your token is invalid!");
	});
});
