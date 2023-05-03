const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");

const baseURL = "/auth/otp/disable";

describe(`"DELETE" ${baseURL} - Disable OTP`, () => {
	it("1. Disable OTP successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Enable OTP
		await User.findOneAndUpdate({ _id: user.id }, { $set: { isOTPEnabled: true } });

		// (4) Disable OTP
		const { status, body } = await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (6) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("You disabled OTP successfully");
	});

	it("2. OTP is already disabled", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Disable OTP
		const { status, body } = await request(app).delete(baseURL).set("Authorization", `Bearer ${accessToken}`);

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(400);
		expect(body.data).toBe("Sorry, you already disabled OTP!");
	});

	it("3. Disable route is private", async () => {
		const { status, body } = await request(app).delete(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
});
