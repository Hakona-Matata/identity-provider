const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const { generate_hash } = require("./../../../src/helpers/hash");
const { generate_token } = require("./../../../src/helpers/token");

const User = require("./../../../src/app/Models/User.model");

const baseURL = "/auth/password/reset";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"PUT" ${baseURL} - Reset Password`, () => {
	it("1. Reset password successfully", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Generate resetToken
		const resetToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.RESET_PASSWORD_SECRET,
			expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN,
		});

		// (3) Update user document
		await User.findOneAndUpdate({ _id: user._id }, { $set: { resetToken } });

		// (4) Reset password
		const { status, body } = await request(app).put(baseURL).send({
			resetToken,
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		// (5) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (6) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("Password reset was successful");
	});

	it("2. Provided resetToken is already used", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Generate valid resetToken
		const resetToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.RESET_PASSWORD_SECRET,
			expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN,
		});

		// (3) Reset Password
		const { status, body } = await request(app).put(baseURL).send({
			resetToken,
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });

		// (5) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, you already reset your password!");
	});

	//==============================================================

	it("3. Reset token is not provided", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"resetToken" param is required!`);
	});

	it("4. Reset token can't be empty", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: "",
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"resetToken" param can't be empty!`);
	});

	it("5. Reset token is not of type string", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: 234532,
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"resetToken" param has to be of type string!`);
	});

	it("6. Reset token is too short to be true", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			resetToken: "12",
			password: "tesTE!@12",
			confirmPassword: "tesTE!@12",
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"resetToken" param can't be true!`);
	});

	it("7. Reset token is too long to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(200),
				password: "tesTE!@12",
				confirmPassword: "tesTE!@12",
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"resetToken" param can't be true!`);
	});

	//==============================================================
	it("8. password and confirmPassword fields don't match", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "tesTE!@12",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"confirmPassword" field doesn't match "password" field`
		);
	});

	//==============================================================

	it("9. password field can't be empty", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(2);
		expect(body.data[0]).toBe(`"password" field can't be empty!`);
		expect(body.data[1]).toBe(
			`"confirmPassword" field doesn't match "password" field`
		);
	});

	it("10. password field is not provided", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),

				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(2);
		expect(body.data[0]).toBe('"password" field is required!');
		expect(body.data[1]).toBe(
			`"confirmPassword" field doesn't match "password" field`
		);
	});

	it("11. password field is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: 123423423,
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(2);
		expect(body.data[0]).toBe('"password" field has to be of type string!');
		expect(body.data[1]).toBe(
			`"confirmPassword" field doesn't match "password" field`
		);
	});

	it("12. password field is too short to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "123",
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(3);
		expect(body.data[0]).toBe(
			`"password" field can't be less than 8 characters!`
		);
		expect(body.data[1]).toBe(
			'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)'
		);

		expect(body.data[2]).toBe(
			`"confirmPassword" field doesn't match "password" field`
		);
	});

	it("13. password field is too long to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "123".repeat(100),
				confirmPassword: "tesTE!@34",
			});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(3);
		expect(body.data[0]).toBe(
			`"password" field can't be more than 16 characers!`
		);
		expect(body.data[1]).toBe(
			'"password" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)'
		);

		expect(body.data[2]).toBe(
			`"confirmPassword" field doesn't match "password" field`
		);
	});
	//==============================================================

	it("14. confirmPassowrd is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({
				resetToken: "12".repeat(70),
				password: "teST12!@",
				confirmPassword: 123423423423,
			});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"confirmPassword" field doesn't match "password" field`
		);
		expect(body.data[1]).toBe('"confirmPassword" must be a string');
	});
});
