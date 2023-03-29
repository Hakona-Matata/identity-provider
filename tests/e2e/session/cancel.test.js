const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

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

		const currentSession = await Session.findOne({
			accessToken,
			userId: user.id.toString(),
		});

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ sessionId: currentSession.id });

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: "Session is cancelled successfully!",
		});
	});

	it("2. User can't delete session of other user", async () => {
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

		const user2CurrentSession = await Session.findOne({
			userId: user2.id,
			accessToken2,
		});

		const { status, body } = await request(app)
			.post(baseURL)
			.set("authorization", `Bearer ${accessToken1}`)
			.send({ sessionId: user2CurrentSession.id });

		expect(status).toBe(STATUS.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, you can't cancel this session!",
		});
	});

	//====================================================================

	it("3. sessionId field is not provided", async () => {
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
			.set("authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"sessionId" field is required!'],
		});
	});

	it("4. sessionId field can't be empty", async () => {
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
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"sessionId" field can't be empty!`],
		});
	});

	it("5. sessionId field is not of type string", async () => {
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
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: +"1".repeat(24) });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"sessionId" field has to be of type string!`],
		});
	});

	it("6. sessionId field is too short to be true", async () => {
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
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "1".repeat(20) });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"sessionId" field is not a valid ID`],
		});
	});

	it("7. sessionId field is too long to be true", async () => {
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
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "1".repeat(30) });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"sessionId" field is not a valid ID`],
		});
	});

	it("8. sessionId field is not a valid mongodb ID", async () => {
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
			.set("authorization", `Bearer ${accessToken}`)
			.send({ sessionId: "1".repeat(24) });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"sessionId" field is not a valid ID`],
		});
	});
});
