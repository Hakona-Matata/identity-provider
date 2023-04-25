const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const app = require("../../../src/server");

const { generate_hash } = require("./../../../src/helpers/hash");
const { generate_token } = require("./../../../src/helpers/token");

const User = require("./../../../src/app/Models/User.model");

const baseURL = "/auth/password/forget";

describe(`"POST" ${baseURL} - Forget Password`, () => {
	it("1. Initiate forget password successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
		});

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			data: `Please, check your mailbox!`,
		});
	});

	it("2. Email is not among our DB users", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "blabla@gmail.com" });

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			data: `Please, check your mailbox!`,
		});
	});

	it("3. User already intiated forget password (should check his mailbox)", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const resetToken = await generate_token({
			payload: { _id: user._id },
			secret: process.env.RESET_PASSWORD_SECRET,
			expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN,
		});

		await User.findOneAndUpdate({ _id: user._id }, { $set: { resetToken } });

		const { status, body } = await request(app).post(baseURL).send({
			email: user.email,
		});

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: "Sorry, your mailbox already has a valid reset link!",
		});
	});

	//===============================================================

	it("4. Email field is not provided", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: ['"email" field is required!'],
		});
	});

	it("5. Email field can't be empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be empty!`],
		});
	});

	it("6. Email field too short to be true", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "q@gmail.com" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be less than 15 characters!`],
		});
	});

	it("7. Email field too long to be true", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: `${"s".repeat(200)}@gmail.com` });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be more than 40 characers!`, `"email" field has to be a valid email!`],
		});
	});

	it("8. Email field is not a valid email", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: `dsfaasdfsadfadfgmailcom` });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field has to be a valid email!`],
		});
	});

	// it("9. Email field is not of type string", async () => {
	// 	const { status, body } = await request(app).post(baseURL).send({ email: 1111111111111111111111111 });

	// 	expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
	// 	expect(body).toEqual({
	// 		success: false,
	// 		status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
	// 		code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
	// 		message: [`"email" field has to be of type string!`],
	// 	});
	// });
});
