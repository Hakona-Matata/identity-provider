const request = require("supertest");
const { faker } = require("@faker-js/faker");


const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");
const { generate_randomNumber } = require("./../../../src/helpers/randomNumber");

const User = require("../../../src/app/Models/User.model");
const OTP = require("./../../../src/app/Models/OTP.model");

const baseURL = "/auth/otp/verify";

describe(`"POST" ${baseURL} - Verify OTP code during login process`, () => {
	it("1. Verify OTP code successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Generate OTP | 6 random numbers
		const plainTextOTP = generate_randomNumber({ length: 6 });

		// (3) Hash OTP!
		const hashedOTP = await generate_hash(`${plainTextOTP}`);

		// (4) Save it into DB
		await OTP.create({ userId: user.id, otp: hashedOTP, by: "EMAIL" });

		// (5) Verify OTP
		const { status, body } = await request(app).post(baseURL).send({
			userId: user.id,
			otp: plainTextOTP,
		});

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await OTP.findOneAndDelete({ userId: user.id, by: "EMAIL" });

		// (7) Our expectations
		expect(status).toBe(200);
		expect(body).toHaveProperty("data.accessToken");
		expect(body).toHaveProperty("data.refreshToken");
	});

	it("2. OTP code is expired", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Verify OTP
		const { status, body } = await request(app).post(baseURL).send({
			userId: user.id,
			otp: 123123,
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, the OTP may be expired!");
	});

	it("3. Invalid OTP code", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Generate OTP | 6 random numbers
		const plainTextOTP = generate_randomNumber({ length: 6 });

		// (3) Hash OTP!
		const hashedOTP = await generate_hash(`${plainTextOTP}`);

		// (4) Save it into DB
		await OTP.create({ userId: user.id, otp: hashedOTP, by: "EMAIL" });

		// (5) Verify OTP
		const { status, body } = await request(app).post(baseURL).send({
			userId: user.id,
			otp: 123123,
		});

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await OTP.findOneAndDelete({ userId: user.id, by: "EMAIL" });

		// (7) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your OTP is invalid!");
	});

	it("4. More than 3 times wrong OTP code", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		await OTP.create({ userId: user.id, count: 3, by: "EMAIL", otp: 123123 });

		// (2) Verify OTP

		const { status, body } = await request(app).post(baseURL).send({
			userId: user.id,
			otp: 123123,
		});

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (7) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, You have reached your maximum wrong tries!");
	});

	it("5. OTP code and userId fields are not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(422);
		expect(body.data.length).toBe(2);
		expect(body.data[0]).toBe('"userId" field is required!');
		expect(body.data[1]).toBe('"otp" field is required!');
	});

	//===================================================

	it("6. OTP code is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "64141cb6c9a4394fcdf04e37",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field is required!`);
	});

	it("7. OTP code can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "64141cb6c9a4394fcdf04e37",
			otp: "",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be of type number!`);
	});

	it("8. OTP code is not of type number", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "64141cb6c9a4394fcdf04e37",
			otp: "testte",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be of type number!`);
	});

	it("9. OTP code is a negative number", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "64141cb6c9a4394fcdf04e37",
			otp: -123123,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be positive!`);
	});

	it("10. OTP code is not integer number", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "64141cb6c9a4394fcdf04e37",
			otp: 0.121312,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be integer!`);
	});

	it("11. OTP code is too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "64141cb6c9a4394fcdf04e37",
			otp: 123,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be 6 digits!`);
	});

	it("12. OTP code is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				userId: "64141cb6c9a4394fcdf04e37",
				otp: +"1".repeat(10),
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be 6 digits!`);
	});

	//==========================================================

	it("13. userId field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				otp: 12313,
				userId: +"1".repeat(24),
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field has to be of type string!`);
	});

	it("14. userId field can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			otp: 12313,
			userId: "",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field can't be empty!`);
	});

	it("15. userId field is too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			otp: 12313,
			userId: "1234",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});

	it("16. userId field is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				otp: 12313,
				userId: "1234".repeat(20),
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});
});
