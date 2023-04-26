const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index.js");


const request = require("supertest");
const { faker } = require("@faker-js/faker");

const app = require("../../../src/server");

const User = require("./../../../src/app/Models/User.model");

const { generate_hash } = require("./../../../src/helpers/hash");

const baseURL = "/auth/account/cancel-delete";



describe(`"PUT" ${baseURL} - Cancel account deletion`, () => {
	it("1. Cancel account deletion successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).put(baseURL).send({
			email: user.email,
		});

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			data: "You canceled the account deletion successfully!",
		});
	});

	it("2. Account deletion is too late", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			email: "testtest@gmail.com",
		});

		expect(status).toBe(httpStatusCodeNumbers.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.BAD_REQUEST,
			code: httpStatusCodeStrings.BAD_REQUEST,
			message: "Sorry, your account may be deleted permanently! (too late)",
		});
	});

	it("3. Account is not found in our DB", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			email: "testtest@gmail.com",
		});

		expect(status).toBe(httpStatusCodeNumbers.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.BAD_REQUEST,
			code: httpStatusCodeStrings.BAD_REQUEST,
			message: "Sorry, your account may be deleted permanently! (too late)",
		});
	});

	it("4. Account deletion is already canceled", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: false,
			password: await generate_hash("tesTES@!#1232"),
		});

		const { status, body } = await request(app).put(baseURL).send({
			email: user.email,
		});

		expect(status).toBe(httpStatusCodeNumbers.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.BAD_REQUEST,
			code: httpStatusCodeStrings.BAD_REQUEST,
			message: "Sorry, you already canceled account deletion!",
		});
	});

	it("5. Account deletion route is public", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			email: "testtest@gmail.com",
		});

		expect(status).toBe(httpStatusCodeNumbers.BAD_REQUEST);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.BAD_REQUEST,
			code: httpStatusCodeStrings.BAD_REQUEST,
			message: "Sorry, your account may be deleted permanently! (too late)",
		});
	});

	// =================================================================

	it("6. email field is not provided", async () => {
		const { status, body } = await request(app).put(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: ['"email" field is required!'],
		});
	});

	it("7. email field is not of type string", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: 11111111111 });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field has to be of type string!`],
		});
	});

	it("8. email field is not a valid email", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "111111111234213423111" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field has to be a valid email!`],
		});
	});

	it("9. email field can't be empty", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be empty!`],
		});
	});

	it("9. email field is too short to be true", async () => {
		const { status, body } = await request(app)
			.put(baseURL)
			.send({ email: "k@gmail.com" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be less than 15 characters!`],
		});
	});

	it("9. email field is long short to be true", async () => {
		const { status, body } = await request(app).put(baseURL).send({
			email:
				"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk@gmail.com",
		});

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: [`"email" field can't be more than 40 characers!`],
		});
	});
});
