const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");
const {
	generate_randomNumber,
} = require("./../../../src/helpers/randomNumber");

const User = require("../../../src/app/Models/User.model");
const Session = require("../../../src/app/Models/Session.model");
const OTP = require("./../../../src/app/Models/OTP.model");

const baseURL = "/auth/otp/send";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"POST" ${baseURL} - Send OTP during login process`, () => {
	it("1. Send OTP successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Send OTP
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			userId: user.id,
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await OTP.findOneAndDelete({ userId: user.id, by: "EMAIL" });

		// (4) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("Please, check your mailbox for the OTP code");
	});

	it("2. User mailbox still have valid OTP", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Send OTP
		await request(app).post(baseURL).send({
			email: user.email,
			userId: user.id,
		});

		// Another time!
		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
			userId: user.id,
		});

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await OTP.findOneAndDelete({ userId: user.id, by: "EMAIL" });

		// (4) Our expectations
		expect(status).toBe(400);
		expect(body.data).toBe(
			"Sorry, we already sent you OTP and it's still valid!"
		);
	});

	it("3. Email and userId fields are not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(422);
		expect(body.data.length).toBe(2);
		expect(body.data[0]).toBe('"userId" field is required!');
		expect(body.data[1]).toBe('"email" field is required!');
	});

	//==================================================================

	it("4. Email field is not of type string", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: 1234234234,
			userId: "63fde3f98277bc1fcb0fe5b9",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field has to be of type string!`);
	});

	it("5. Email field can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "",
			userId: "63fde3f98277bc1fcb0fe5b9",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be empty!`);
	});

	it("6. Email field can't be empty", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: "te".repeat(10),
				userId: "63fde3f98277bc1fcb0fe5b9",
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field has to be a valid email!`);
	});

	it("7. Email field is too short to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: "te".repeat(5),
				userId: "63fde3f98277bc1fcb0fe5b9",
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"email" field can't be less than 15 characters!`
		);
	});

	it("8. Email field is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: "te".repeat(50),
				userId: "63fde3f98277bc1fcb0fe5b9",
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"email" field can't be more than 40 characers!`);
	});

	//==================================================================

	it("9. userId field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: "testtest@gmail.com",
				userId: +"1".repeat(24),
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field has to be of type string!`);
	});

	it("10. userId field can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "testtest@gmail.com",
			userId: "",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field can't be empty!`);
	});

	it("11. userId field is too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			email: "testtest@gmail.com",
			userId: "1234",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});

	it("12. userId field is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				email: "testtest@gmail.com",
				userId: "1234".repeat(20),
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});
});
