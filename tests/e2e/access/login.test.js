const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const { generate_hash } = require("./../../../src/helpers/hash");

const User = require("./../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");

const baseURL = "/auth/login";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Log user In`, () => {
	it("1. Log user In successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken: body.data.accessToken,
		});

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data).toHaveProperty("accessToken");
		expect(body.data).toHaveProperty("refreshToken");
	});

	it("2. Email is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ password: "teST12!@" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field is required!');
	});

	it("3. Password is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "test123@gmail.com" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"password" field is required!');
	});

	it("4. Email is not in valid email format", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "testtesttesttest", password: "tesTT12!@" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field has to be a valid email!');
	});

	it("5. Email is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "t@test.com", password: "tesTT12!@" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"email" field can't be less than 15 characters!`
		);
	});

	it("6. Email is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: `${"t".repeat(50)}@test.com`, password: "tesTT12!@" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be more than 40 characers!`);
	});

	it("7. Email is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: 111111111111, password: "tesTT12!@" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"email" field has to be of type string!');
	});

	it("8. Email can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "", password: "tesTT12!@" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be empty!`);
	});

	it("9. Password can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "test123@gmail.com",
			password: "",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"password" field can't be empty!`);
	});

	it("10. Password is too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "test2312@gmail.com",
			password: "12",
		});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(2);
	});

	it("11. Password is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: "teste23@gmail.com",
				password: `${"test".repeat(50)}`,
			});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(2);
	});

	it("12. Password is not of string type", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "tests@gmaiol.com",
			password: 23532455,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"password" field has to be of type string!');
	});

	it("13. Given email is incorrect", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "blabla@gmail.com",
			password: "tesTES@!#1232",
		});

		expect(status).toBe(422);
		expect(body.data).toBe(`Email or password is incorrect!`);
	});

	it("14. Given password is incorrect", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1233",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(422);
		expect(body.data).toBe(`Email or password is incorrect!`);
	});

	it("15. User email must be verified", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe(`Sorry, your email address isn't verified yet!`);
	});

	it("16. User account is inactive/ disabled", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe(`Sorry, you need to activate your email first!`);
	});

	it("17. User account has 1 2fa method active", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data.methods.length).toEqual(1);
		expect(body.data.userId).toEqual(user._id.toString());
		expect(body.data.message).toEqual(
			"Please, choose one of the given 2FA methods!"
		);
	});

	it("18. User account has 2 2fa method active", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			isTOTPEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data.methods.length).toEqual(2);
		expect(body.data.userId).toEqual(user._id.toString());
		expect(body.data.message).toEqual(
			"Please, choose one of the given 2FA methods!"
		);
	});

	it("19. User account has 3 2fa method active", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isOTPEnabled: true,
			isTOTPEnabled: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			password: "tesTES@!#1232",
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user._id });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data.methods.length).toEqual(3);
		expect(body.data.userId).toEqual(user._id.toString());
		expect(body.data.message).toEqual(
			"Please, choose one of the given 2FA methods!"
		);
	});
});
