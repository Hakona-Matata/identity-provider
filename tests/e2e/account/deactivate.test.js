const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const { generate_hash } = require("./../../../src/helpers/hash");

const User = require("./../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");

const baseURL = "/auth/account/deactivate";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"PUT" ${baseURL} - Deactivate User Account`, () => {
	it("1. Deactivate account successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to have the needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Deactivate user account
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		// (5) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("Account deactivated successfully!");
	});

	it(`2. No accessToken is provided`, async () => {
		const { status, body } = await request(app).put(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});

	it(`3. account is already deactivated`, async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to have the needed accessToken
		const { status, body } = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (4) Our expectaions | The middleware should prevent his access!
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you need to activate your email first!");
	});
});
