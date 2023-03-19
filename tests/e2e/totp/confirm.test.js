const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");
const { generate_totp } = require("./../../../src/helpers/totp");

const User = require("../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");
const TOTP = require("./../../../src/app/Models/TOTP.model");

const baseURL = "/auth/totp/confirm";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Confirm Enabling TOTP as security layer`, () => {
	it("1. Confirm enabling TOTP successfullly", async () => {
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

		// (3) Initiate enabling TOTP to get needed secret!
		const {
			body: {
				data: { secret },
			},
		} = await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Generate TOTP based on that secret!
		const currentTOTP = generate_totp({ secret });

		// (5) Confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: currentTOTP });

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await TOTP.deleteMany({ userId: user.id });

		// (7) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("TOTP enabled successfully!");
	});

	it("2. TOTP is expired", async () => {
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

		// (3) Initiate enabling TOTP to get needed secret!
		const {
			body: {
				data: { secret },
			},
		} = await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Generate TOTP based on that secret!
		const currentTOTP = generate_totp({ secret });

		// (5) Wait for a minute until it's expired! (70 seconds)
		await new Promise((resolve) => setTimeout(resolve, 70000));

		// (6) Confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: currentTOTP });

		// (7) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await TOTP.deleteMany({ userId: user.id });

		// (8) Our expectations
		expect(status).toBe(422);
		expect(body.data).toBe("Sorry, the given code is invalid");
	});

	it("3. TOTP is invalid", async () => {
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

		// (3) Initiate enabling TOTP to get needed secret!
		const {
			body: {
				data: { secret },
			},
		} = await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Generate TOTP based on that secret!
		const currentTOTP = generate_totp({ secret });

		// (5) Confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await TOTP.deleteMany({ userId: user.id });

		// (7) Our expectations
		expect(status).toBe(422);
		expect(body.data).toBe("Sorry, the given code is invalid");
	});

	it("4. More than 3 times of invalid TOTP ", async () => {
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

		// (3) Initiate enabling TOTP to get needed secret!
		const {
			body: {
				data: { secret },
			},
		} = await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Confirm TOTP | 3 invalid times!
		await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await TOTP.deleteMany({ userId: user.id });

		// (6) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you need to start from scratch!");
	});

	it("5. User need to initiate TOTP first", async () => {
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

		// (3) Confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (6) Our expectations
		expect(status).toBe(422);
		expect(body.data).toBe(
			"Sorry, you can't confirm TOTP before setting it up!"
		);
	});

	it("6. TOTP is already confirmed", async () => {
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

		// (3) Update TOTP document
		await TOTP.create({ userId: user.id, isSecretTemp: false });

		// (4) Confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await TOTP.deleteMany({ useId: user.id });

		// (6) Our expectations
		expect(status).toBe(400);
		expect(body.data).toBe("Sorry, you already confirmed TOTP!");
	});

	it("7. TOTP confirm route is private", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});
	// ===========================================================

	it("8. TOTP code is not provided", async () => {
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

		// (3) confirm
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ useId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field is required!`);
	});

	it("9. TOTP code is not of type string", async () => {
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

		// (3) confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: 123123 });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ useId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field has to be of type string!`);
	});

	it("10. TOTP code can't be empty", async () => {
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

		// (3) confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "" });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ useId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field can't be empty!`);
	});

	it("10. TOTP code is too short to be true", async () => {
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

		// (3) confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123" });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ useId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field length must be 6 digits!`);
	});

	it("10. TOTP code is too long to be true", async () => {
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

		// (3) confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123123" });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ useId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field length must be 6 digits!`);
	});

	it("12. TOTP code is float not integer", async () => {
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

		// (3) confirm TOTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123.132" });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ useId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"totp" field length must be 6 digits!`);
	});
});
