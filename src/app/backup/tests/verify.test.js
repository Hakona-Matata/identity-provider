const request = require("supertest");
const { faker } = require("@faker-js/faker");

const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");
const Backup = require("./../../../src/app/Models/Backup.model");

const baseURL = "/auth/backup/verify";



describe(`"POST" ${baseURL} - Verify Backup codes | Account Recovery`, () => {
	it("1. Verify Backup code and give access successfully", async () => {
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

		const {
			body: { data: codes },
		} = await request(app)
			.post("/auth/backup/generate")
			.set("Authorization", `Bearer ${accessToken}`);

		await request(app)
			.post("/auth/backup/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: codes[0] });

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: user.email, code: codes[1] });

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await Backup.deleteMany({ userId: user.id });

		expect(status).toBe(200);
		expect(body.data).toHaveProperty("accessToken");
		expect(body.data).toHaveProperty("refreshToken");
	});

	it("2. Invalid backup code during verification", async () => {
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

		const {
			body: { data: codes },
		} = await request(app)
			.post("/auth/backup/generate")
			.set("Authorization", `Bearer ${accessToken}`);

		await request(app)
			.post("/auth/backup/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: codes[0] });

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: user.email, code: codes[0] });

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await Backup.deleteMany({ userId: user.id });

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, backup code is invalid!");
	});

	it("3. Invalid backup code during verification", async () => {
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

		const {
			body: { data: codes },
		} = await request(app)
			.post("/auth/backup/generate")
			.set("Authorization", `Bearer ${accessToken}`);

		await request(app)
			.post("/auth/backup/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: codes[0] });

		for (let i = 0; i <= codes.length; i++) {
			await request(app)
				.post(baseURL)
				.send({ email: user.email, code: codes[i] });
		}

		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: user.email, code: codes[0] });

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await Backup.deleteMany({ userId: user.id });

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, no remaining valid codes!");
	});

	it("4. Verify backup code route is public", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "test12345@gmail.com",
			code: 123451234512,
		});

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, backup code is invalid!");
	});

	it("5. email and code fields aren't provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field is required!');
		expect(body.data[1]).toBe('"code" field is required!');
	});

	//====================================================================

	it("6. Email is not a valid email", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "testtesttesttest", code: 123451234512 });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field has to be a valid email!');
	});

	it("7. Email is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "t@test.com", code: 123451234512 });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"email" field can't be less than 15 characters!`
		);
	});

	it("8. Email is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: `${"t".repeat(50)}@test.com`, code: 123451234512 });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be more than 40 characers!`);
	});

	it("9. Email is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: 111111111111, code: 123451234512 });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field has to be of type string!');
	});

	it("10. Email can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "", code: 123451234512 });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be empty!`);
	});

	//====================================================================

	it("11. Backup code has to be of type number", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ code: "", email: "test1234124@gmail.com" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"code" field has to be of type number!');
	});

	it("12. Backup code has to be of type integer", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ code: 22.1234512345, email: "test1234124@gmail.com" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field has to be integer!`);
	});

	it("13. Backup code has to be positive", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ code: -221234512345, email: "test1234124@gmail.com" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field has to be positive!`);
	});

	it("14. Backup code is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ code: 22125, email: "test1234124@gmail.com" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field has to be 12 digits!`);
	});

	it("15. Backup code is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			// .send({ code: 12345123423421234512, email: "test1234124@gmail.com" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field has to be 12 digits!`);
	});
});
