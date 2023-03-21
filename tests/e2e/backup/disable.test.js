const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");
const Backup = require("./../../../src/app/Models/Backup.model");

const baseURL = "/auth/backup/disable";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"DELETE" ${baseURL} - Disable Backup codes`, () => {
	it("1. Disable Backup codes successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		await User.findOneAndUpdate(
			{ _id: user.id },
			{ $set: { isBackupEnabled: true } }
		);

		const { status, body } = await request(app)
			.delete(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOne({ _id: user.id, accessToken });

		expect(status).toBe(200);
		expect(body.data).toBe("Backup codes disabled successfully!");
	});

	it("2. Backup codes is not enabled", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
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

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOne({ _id: user.id, accessToken });

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, backup codes isn't enabled!");
	});

	it("3. Backup codes route is private", async () => {
		const { status, body } = await request(app).delete(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
});
