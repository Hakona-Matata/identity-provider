const request = require("supertest");
const { faker } = require("@faker-js/faker");

const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");
const Backup = require("./../../../src/app/Models/Backup.model");

const baseURL = "/auth/backup/regenerate";



describe(`"POST" ${baseURL} - Regenerate New Backup codes`, () => {
	it("1. Regenerate new backup codes successfully", async () => {
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
			{ $set: { isOTPEnabled: true } }
		);

		await request(app)
			.post("/auth/backup/generate")
			.set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await Backup.deleteMany({ userId: user.id });

		expect(status).toBe(200);
		expect(body.data.length).toEqual(10);
	});

	it("2. User can't regenerate codes if he doesn't previously generated ones", async () => {
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
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you can't regenerate backup codes!");
	});

	it("3. Regenerate backup codes route is private", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
});
