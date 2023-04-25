const request = require("supertest");
const { faker } = require("@faker-js/faker");


const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");
const OTP = require("./../../../src/app/Models/OTP.model");

const baseURL = "/auth/sms/send";



describe(`"POST" ${baseURL} - Send OTP over SMS`, () => {
	it("1. Send OTP over sms successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Send OTP over SMS
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await OTP.findOneAndDelete({ userId: user.id, by: "SMS" });

		// (4) Our exectations
		expect(status).toBe(200);
		expect(body.data).toBe("OTP sent to your phone successfully");
	});

	it("2. OTP over SMS is disabled", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Send SMS
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (4) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, we can't send you OTP over SMS!");
	});

	it("3. User still have valid OTP over SMS", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isSMSEnabled: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Send OTP over SMS
		await request(app).post(baseURL).send({ userId: user.id });
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: user.id });

		// (3) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await OTP.findOneAndDelete({ userId: user.id, by: "SMS" });

		// (4) Our exectations
		expect(status).toBe(400);
		expect(body.data).toBe("Sorry, the OTP sent to your phone is still valid!");
	});

	it("4. OTP over SMS is public route", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ userId: "63f9cd1667da3af21df4e734" });

		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, we can't send you OTP over SMS!");
	});

	//================================================================

	it("9. userId field is not of type string", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				userId: +"1".repeat(24),
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field has to be of type string!`);
	});

	it("10. userId field can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field can't be empty!`);
	});

	it("11. userId field is too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({
			userId: "1234",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});

	it("12. userId field is too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({
				userId: "1234".repeat(20),
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"userId" field is not a valid ID`);
	});
});
