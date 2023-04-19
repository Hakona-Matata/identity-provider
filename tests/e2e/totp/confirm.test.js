const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");
const { generate_totp } = require("./../../../src/helpers/totp");

const User = require("../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");
const TOTP = require("./../../../src/app/Models/TOTP.model");
const await_all = require("./../../../src/helpers/awaitAll");

const baseURL = "/auth/totp/confirm";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Confirm Enabling TOTP as security layer`, () => {
	it("1. Confirm enabling TOTP successfullly", async () => {
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

		const {
			body: {
				data: { secret },
			},
		} = await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		const generatedTOTP = generate_totp({ secret });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: generatedTOTP });

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: "TOTP enabled successfully!",
		});
	});

	it("2. TOTP is expired", async () => {
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

		const {
			body: {
				data: { secret },
			},
		} = await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		const generatedTOTP = generate_totp({ secret });

		await new Promise((resolve) => setTimeout(resolve, 70000));

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: generatedTOTP });

		expect(status).toBe(STATUS.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, the given code is invalid!",
		});
	});

	it("3. TOTP is invalid", async () => {
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

		await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		expect(status).toBe(STATUS.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, the given code is invalid!",
		});
	});

	it.only("4. More than 3 times of invalid TOTP ", async () => {
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

		await request(app)
			.post("/auth/totp/enable")
			.set("Authorization", `Bearer ${accessToken}`);

		const asyncFn = () => {
			return request(app)
				.post(baseURL)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ totp: "123123" });
		};

		const resutl = await await_all({ count: 3, asyncFn });
		console.log({ resutl });
		const uuuu = await TOTP.findOne({ userId: user.id });
		console.log({ uuuu });
		console.log("-----------------");
		// await request(app)
		// 	.post(baseURL)
		// 	.set("Authorization", `Bearer ${accessToken}`)
		// 	.send({ totp: "123123" });
		// await request(app)
		// 	.post(baseURL)
		// 	.set("Authorization", `Bearer ${accessToken}`)
		// 	.send({ totp: "123123" });
		// await request(app)
		// 	.post(baseURL)
		// 	.set("Authorization", `Bearer ${accessToken}`)
		// 	.send({ totp: "123123" });

		// const { status, body } = await request(app)
		// 	.post(baseURL)
		// 	.set("Authorization", `Bearer ${accessToken}`)
		// 	.send({ totp: "123123" });

		// console.log({ status, body });
		// expect(status).toBe(STATUS.FORBIDDEN);
		// expect(body).toEqual({
		// 	success: false,
		// 	status: STATUS.FORBIDDEN,
		// 	code: CODE.FORBIDDEN,
		// 	message: "Sorry, you need to start from scratch!",
		// });
	});

	it("5. User need to initiate TOTP first", async () => {
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
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ totp: "123123" });

		console.log({ status, body });

		expect(status).toBe(STATUS.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: STATUS.FORBIDDEN,
			code: CODE.FORBIDDEN,
			message: "Sorry, you can't confirm TOTP before setting it up!",
		});
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
