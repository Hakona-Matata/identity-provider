const request = require("supertest");
const { faker } = require("@faker-js/faker");

const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");
const Backup = require("./../../../src/app/Models/Backup.model");

const baseURL = "/auth/backup/generate";



describe(`"POST" ${baseURL} - Generate Backup codes`, () => {
	it("1. Generate Backup codes succesfully", async () => {
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

		// (3) Enable at least one 2FA method
		await User.findOneAndUpdate(
			{ _id: user.id },
			{ $set: { isOTPEnabled: true } }
		);

		// (4) Generate backup codes
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await Backup.deleteMany({ userId: user.id });

		// (6) Our expectations
		expect(status).toBe(200);
		expect(body.data.length).toBe(10);
	});

	it("2. User must enable at least one 2FA method", async () => {
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

		// (3) Generate backup codes
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe(
			"Sorry, you can't generate backup codes without any enabled 2fa methods!"
		);
	});

	it("3. Backup codes already generated", async () => {
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

		// (3) Enable at least one 2FA method
		await User.findOneAndUpdate(
			{ _id: user.id },
			{ $set: { isOTPEnabled: true } }
		);

		// (4) Generate backup codes
		await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await Backup.deleteMany({ userId: user.id });

		// (5) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you already generated backup codes!");
	});

	it("4. Backup codes already enabled", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isBackupEnabled: true,
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

		// (3) Enable at least one 2FA method
		await User.findOneAndUpdate(
			{ _id: user.id },
			{ $set: { isOTPEnabled: true } }
		);

		// (4) Generate backup codes
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await Backup.deleteMany({ userId: user.id });

		// (5) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, backup codes feature already enabled!");
	});

	it("5. Generate backup codes route is private", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
});
