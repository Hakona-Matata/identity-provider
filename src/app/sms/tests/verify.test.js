const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");
const {
	generate_randomNumber,
} = require("./../../../src/helpers/randomNumber");

const User = require("../../../src/app/Models/User.model");
const OTP = require("./../../../src/app/Models/OTP.model");

const baseURL = "/auth/sms/verify";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Verify OTP over SMS`, () => {
	it("1. verify OTP over SMS successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (3) Generate OTP | 6 random numbers
		const plainTextOTP = generate_randomNumber({ length: 6 });

		// (4) Hash generated OTP!
		const hashedOTP = await generate_hash(`${plainTextOTP}`);

		// (4) Save OTP
		await OTP.create({ userId: user.id, otp: hashedOTP, by: "SMS" });

		// (5) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id, otp: plainTextOTP });

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (7) Our expectations
		expect(status).toBe(200);
		expect(body.data).toHaveProperty("accessToken");
		expect(body.data).toHaveProperty("refreshToken");
	});

	it("2. OTP code over SMS is not enabled!", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id, otp: 123132 });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you can't verify OTP over SMS");
	});

	it("3. OTP code over SMS is expired", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id, otp: 123132 });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your OTP may be expired!");
	});

	it("4. OTP code over SMS is invalid", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Generate OTP | 6 random numbers
		const plainTextOTP = generate_randomNumber({ length: 6 });

		// (3) Hash generated OTP!
		const hashedOTP = await generate_hash(`${plainTextOTP}`);

		// (4) Save OTP
		const fakeOTP = await OTP.create({
			userId: user.id,
			otp: hashedOTP,
			by: "SMS",
		});

		// (5) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id, otp: 312312 });

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await OTP.findOneAndDelete({ _id: fakeOTP.id });

		// () Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your OTP is invalid!");
	});

	it("5. OTP code over SMS has sent 3 times wrong", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Generate OTP | 6 random numbers
		const plainTextOTP = generate_randomNumber({ length: 6 });

		// (3) Hash generated OTP!
		const hashedOTP = await generate_hash(`${plainTextOTP}`);

		// (4) Save OTP
		const fakeOTP = await OTP.create({
			userId: user.id,
			otp: hashedOTP,
			by: "SMS",
		});

		// (5) Confirm OTP
		await request(app).post(baseURL).send({ userId: user.id, otp: 312312 });
		await request(app).post(baseURL).send({ userId: user.id, otp: 312312 });
		await request(app).post(baseURL).send({ userId: user.id, otp: 312312 });
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id, otp: 312312 });

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await OTP.findOneAndDelete({ _id: fakeOTP.id });

		// () Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, You have reached your maximum wrong tries!");
	});

	it("6. OTP over SMS is public route", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: "63f9cd1667da3af21df4e734", otp: 123123 });

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you can't verify OTP over SMS");
	});

	//=============================================================
	it("7. userId field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				userId: +"1".repeat(24),
				otp: 123123,
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field has to be of type string!`);
	});

	it("8. userId field can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			otp: 123123,
			userId: "",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field can't be empty!`);
	});

	it("9. userId field is too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "1234",
			otp: 123123,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});

	it("10. userId field is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				userId: "1234".repeat(20),
				otp: 123123,
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});

	it("11. userId field is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: 123123 });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is required!`);
	});
	//=============================================================

	it("12. OTP code is not provided", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field is required!`);
	});

	it("13. OTP code has to be of type number", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: "", userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be of type number!`);
	});

	it("14. OTP code has to be integer", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: +"11.2233", userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be integer!`);
	});

	it("15. OTP code has to be positive", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: -123123, userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be positive!`);
	});

	it("16. OTP code is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: 123, userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be 6 digits!`);
	});

	it("17. OTP code is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ otp: 123123123, userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be 6 digits!`);
	});
});
