const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");
const { generate_totp } = require("../../../src/helpers/totp");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");
const TOTP = require("../../../src/app/Models/TOTP.model");

const baseURL = "/auth/totp/verify";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Verify TOTP as during login`, () => {
	it("1. Verify TOTP successfully", async () => {
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

		// (3) Initiate TOTP
		const {
			body: {
				data: { secret },
			},
		} = await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Generate TOTP form returned secret (This time is for confirming)
		const firstTOTP = generate_totp({ secret });

		// (5) Confirm TOTP enabling => Feature should be enabled now!
		await request(app)
			.post("/auth/totp/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: firstTOTP });

		// (6) Generate another TOTP (this time is for verifying!)
		const secondTOTP = generate_totp({ secret });

		// (7) Verify TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id, totp: secondTOTP });

		// (8) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await TOTP.deleteMany({ userId: user.id });

		// (9) Our expectations
		expect(status).toBe(200);
		expect(body.data).toHaveProperty("accessToken");
		expect(body.data).toHaveProperty("refreshToken");
	});

	it("2. Given user is not among our db users", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: "64171cbd792d92b7ed2416b9", totp: "123123" });

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, the given code is invalid");
	});

	it(`3. Given user is valid, but didn't enabled TOTP`, async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Verify TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id, totp: "123123" });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, TOTP is not enabled!");
	});

	it("4. Given TOTP code is invalid", async () => {
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

		// (3) Initiate TOTP
		const {
			body: {
				data: { secret },
			},
		} = await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Generate TOTP form returned secret (This time is for confirming)
		const firstTOTP = generate_totp({ secret });

		// (5) Confirm TOTP enabling => Feature should be enabled now!
		await request(app)
			.post("/auth/totp/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: firstTOTP });

		// (6) Verify TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id, totp: "123123" });

		// (7) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await TOTP.deleteMany({ userId: user.id });

		// (8) Our expectations
		expect(status).toBe(422);
		expect(body.data).toBe("Sorry, the given code is invalid");
	});

	it("5. Verify TOTP is publc route", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(422);
		expect(body.data.length).toBe(2);
	});

	//========================================================

	it("8. TOTP code is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "64171cbd792d92b7ed2416b3",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field is required!`);
	});

	it("9. TOTP code is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: 123123, userId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field has to be of type string!`);
	});

	it("10. TOTP code can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: "", userId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field can't be empty!`);
	});

	it("11. TOTP code is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: "123", userId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field length must be 6 digits!`);
	});

	it("12. TOTP code is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: "123123123", userId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field length must be 6 digits!`);
	});

	it("13. TOTP code is float not integer", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: "123.132", userId: "64171cbd792d92b7ed2416b3" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field length must be 6 digits!`);
	});

	//========================================================
	it("14. userId field is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ totp: "123123" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"userId" field is required!');
	});

	it("15. usersId field can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: "", totp: "123123" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field can't be empty!`);
	});

	it("16. userId field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: +"1".repeat(24), totp: "123123" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field has to be of type string!`);
	});

	it("17. userId field is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: "1".repeat(20), totp: "123123" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});

	it("18. userId field is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: "1".repeat(30), totp: "123123" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});

	it("19. userId field is not a valid mongodb ID", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: "1".repeat(24), totp: "123123" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});
});
