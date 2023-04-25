const request = require("supertest");
const { faker } = require("@faker-js/faker");

const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");

const baseURL = "/auth/totp/disable";

describe(`"DELETE" ${baseURL} - Disable TOTP as security layer`, () => {
	it("1. Disable TOTP successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Enable TOTP
		await User.findOneAndUpdate({ _id: user.id }, { $set: { isTOTPEnabled: true } });

		// (4) Disable TOTP
		const { status, body } = await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (6) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("TOTP disabled successfully!");
	});

	it("2. TOTP is already disabled", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Enable TOTP
		await User.findOneAndUpdate({ _id: user.id }, { $set: { isTOTPEnabled: true } });

		// (4) Disable TOTP
		await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (6) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you already disabled TOTP!");
	});

	it("3. TOTP diable route is private", async () => {
		const { status, body } = await request(app).delete(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
});
