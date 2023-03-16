const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_token } = require("./../../../src/helpers/token");
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

describe(`"GET" ${baseURL} - Get All user sessions (valid, expired)`, () => {
	it("1. Get all user sessions successfully (Only valid token there!)", async () => {
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

		// (3) Get all current sessions!
		const { status, body } = await request(app)
			.get(baseURL)
			.set("authorization", `Bearer ${accessToken}`);

		// (4) Get generated session
		const currentSession = await Session.findOne({ accessToken });

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		// (6) Our expectations
		expect(status).toBe(200);
		expect(body.data.count).toBe(1);
		expect(body.data.sessions[0]._id).toEqual(currentSession.id);
		expect(body.data.sessions[0].isValid).toBe(true);
	});

	it("2. Get all user sessions (valid and expired) ones", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get the needed valid tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Get the just generated valid session (Use it later!)
		const validSession = await Session.findOne({
			userId: user.id.toString(),
			accessToken,
		});

		// (4) Generate fake tokens
		const fakeAccessToken = await generate_token({
			payload: { _id: user.id },
			secret: process.env.ACCESS_TOKEN_SECRET,
			expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
		});
		const fakeRefreshToken = await generate_token({
			payload: { _id: user.id },
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: 1, // expires In 1 second!
		});

		// (5) Generate and save that fake new Session with these tokens
		const fakeSession = await Session.create({
			userId: user.id.toString(),
			accessToken: fakeAccessToken,
			refreshToken: fakeRefreshToken,
		});

		// (6) Wait a second
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// (7) Our test |  Get all available sessions (1 valid + 1 expired)!
		const { status, body } = await request(app)
			.get(baseURL)
			.set("authorization", `Bearer ${accessToken}`);

		// (8) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		// (9) Our expectations
		expect(status).toBe(200);
		expect(body.data.count).toBe(2);
		expect(body.data.sessions.length).toBe(2);
		expect(body.data.sessions.filter((session) => session.isValid)[0]._id).toBe(
			validSession.id
		);
		expect(
			body.data.sessions.filter((session) => !session.isValid)[0]._id
		).toBe(fakeSession.id);
	});

	it("3. Returned sessions should be sorted (valid, expired)", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get the needed valid tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Get the just generated valid session (Use it later!)
		const validSession = await Session.findOne({
			userId: user.id.toString(),
			accessToken,
		});

		// (4) Generate fake tokens
		const fakeAccessToken = await generate_token({
			payload: { _id: user.id },
			secret: process.env.ACCESS_TOKEN_SECRET,
			expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
		});
		const fakeRefreshToken = await generate_token({
			payload: { _id: user.id },
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: 1, // expires In 1 second!
		});

		// (5) Generate and save that fake new Session with these tokens
		const fakeSession = await Session.create({
			userId: user.id.toString(),
			accessToken: fakeAccessToken,
			refreshToken: fakeRefreshToken,
		});

		// (6) Our test |  Get all available sessions (1 valid + 1 expired)!
		const { status, body } = await request(app)
			.get(baseURL)
			.set("authorization", `Bearer ${accessToken}`);

		// (7) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.deleteMany({ userId: user.id.toString() });

		// (8) Our expectations
		expect(status).toBe(200);
		expect(body.data.count).toBe(2);
		expect(body.data.sessions.length).toBe(2);
		expect(body.data.sessions[0]._id).toBe(validSession.id);
		expect(body.data.sessions[1]._id).toBe(fakeSession.id);
	});
});
