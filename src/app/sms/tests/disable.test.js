const request = require("supertest");
const { faker } = require("@faker-js/faker");


const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");

const baseURL = "/auth/sms/disable";


describe(`"DELETE" ${baseURL} - Disable SMS`, () => {
	it("1. Disable SMS successfully", async () => {
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
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Enable SMS
		await User.findOneAndUpdate(
			{ _id: user.id },
			{ $set: { isSMSEnabled: true } }
		);

		// (4) Disable SMS
		const { status, body } = await request(app)
			.delete(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (6) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("You disabled OTP over SMS successfully");
	});

	it("2. SMS is already disabled", async () => {
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
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Disable SMS
		const { status, body } = await request(app)
			.delete(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(400);
		expect(body.data).toBe("Sorry, you already disabled OTP over SMS!");
	});

	it("3. Disable SMS is private route", async () => {
		const { status, body } = await request(app).delete(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
});
