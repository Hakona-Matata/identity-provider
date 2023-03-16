const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");

const baseURL = "/auth/sessions/";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Cancel or Revoke User Session`, () => {
	it("1. User can cancel/ revoke any available session he wants", async () => {
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

		// (3) Get generated session
		const currentSession = await Session.findOne({
			accessToken,
			userId: user.id.toString(),
		});

		// (4) Cancel/ revoke session
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ sessionId: currentSession.id });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		// (6) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("Session is cancelled successfully");
	});

	it("2. User can't delete session of other user", async () => {
		// (1) Create and save a fake user
		const user1 = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});
		const user2 = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken: accessToken1 },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user1.email, password: "tesTES@!#1232" });
		const {
			body: {
				data: { accessToken: accessToken2 },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user2.email, password: "tesTES@!#1232" });

		// (3) Get generated session
		const user2CurrentSession = await Session.findOne({
			accessToken2,
			userId: user2.id.toString(),
		});

		// (4) Cancel/ revoke session
		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken1}`)
			.send({ sessionId: user2CurrentSession.id });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user1.id });
		await User.findOneAndDelete({ _id: user2.id });
		await Session.deleteMany({ userId: user1.id.toString() });
		await Session.deleteMany({ userId: user2.id.toString() });

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you can't cancel this session!");
	});

	//====================================================================

	it("3. sessionId field is not provided", async () => {
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

		// (3) Cancel/ revoke session
		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`);

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"sessionId" field is required!');
	});

	it("4. sessionId field can't be empty", async () => {
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

		// (3) Cancel/ revoke session
		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "" });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"sessionId" field can't be empty!`);
	});

	it("5. sessionId field is not of type string", async () => {
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

		// (3) Cancel/ revoke session
		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: +"1".repeat(24) });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"sessionId" field has to be of type string!`);
	});

	it("6. sessionId field is too short to be true", async () => {
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

		// (3) Cancel/ revoke session
		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "1".repeat(20) });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"sessionId" field is not a valid ID`);
	});

	it("7. sessionId field is too long to be true", async () => {
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

		// (3) Cancel/ revoke session
		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "1".repeat(30) });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"sessionId" field is not a valid ID`);
	});

	it("8. sessionId field is not a valid mongodb ID", async () => {
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

		// (3) Cancel/ revoke session
		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "1".repeat(24) });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"sessionId" field is not a valid ID`);
	});
});
