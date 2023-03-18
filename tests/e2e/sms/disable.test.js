const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");
const {
	generate_randomNumber,
} = require("./../../../src/helpers/randomNumber");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");
const OTP = require("./../../../src/app/Models/OTP.model");
const {
	verifyBackupCodes_POST_service,
} = require("../../../src/app/Services/backup.services");
const {
	confirmSMS_POST_controller,
} = require("../../../src/app/controllers/SMS.controllers");
const {
	ExportConfigurationContextImpl,
} = require("twilio/lib/rest/bulkexports/v1/exportConfiguration");

const baseURL = "/auth/sms/disable";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

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

		// (5) Our expectations
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

		// (4) Our expectations
		expect(status).toBe(400);
		expect(body.data).toBe("Sorry, you already disabled OTP over SMS!");
	});

	it("3. Disable SMS is private route", async () => {
		const { status, body } = await request(app).delete(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
});
