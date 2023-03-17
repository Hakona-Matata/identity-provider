const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_token } = require("./../../../src/helpers/token");
const { generate_hash } = require("../../../src/helpers/hash");
const {
	generate_randomNumber,
} = require("./../../../src/helpers/randomNumber");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");
const OTP = require("./../../../src/app/Models/OTP.model");

const baseURL = "/auth/otp/enable";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"GET" ${baseURL} - Initiate enabling OTP as a security Layer`, () => {
	it("1. Initiate enabling OTP successfully", async () => {
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

		// (3) Initiate OTP enabling
		const { status, body } = await request(app)
			.get(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("Please, check your mailbox for the OTP code");
	});

	it("2. OTP is already enabled", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		/*
            (2) Log user In to get needed tokens
            I should get a message telling me that the OTP is enabled
            And, frontend should hit another endpoints to start sending OTP
            But now, no tokens wil return!
        */
		const { status, body } = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data.message).toBe(
			"Please, choose one of the given 2FA methods!"
		);
		expect(body.data.userId).toEqual(user._id.toString());
		expect(body.data.methods.length).toBe(1);
		expect(body.data.methods[0].isOTPEnabled).toBe(true);
	});

	it("3. Initiated OTP enabling already done (User should check his mailbox)", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
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

		// (3) Generate OTP | 6 random numbers
		const plainTextOTP = generate_randomNumber({ length: 6 });

		// (4) Hash OTP!
		const hashedOTP = await generate_hash(`${plainTextOTP}`);

		// (5) Save OTP
		const createdOTP = await OTP.create({
			userId: user.id,
			otp: hashedOTP,
			by: "EMAIL",
		});

		// (6) Initiate OTP enabling
		const { status, body } = await request(app)
			.get(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (7) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await OTP.findOneAndDelete({ _id: createdOTP.id });

		// (8) Our expectations
		expect(status).toBe(400);
		expect(body.data).toBe(
			"Sorry, you still have a valid OTP in your mailbox!"
		);
	});

	it("4. OTP initiating is a private route", async () => {
		const { status, body } = await request(app).get(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
});
