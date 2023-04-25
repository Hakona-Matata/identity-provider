const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants/index.js");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const app = require("../../../src/server");

const { generate_hash } = require("../../../src/helpers/hash");

const User = require("../../../src/app/Models/User.model");

const baseURL = "/auth/totp/enable";

describe(`"POST" ${baseURL} - Enable TOTP as a layer`, () => {
	it("1. Initiate enabling TOTP successfully", async () => {
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
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body.success).toBe(true);
		expect(body.status).toBe(httpStatusCodeNumbers.OK);
		expect(body.code).toBe(httpStatusCodeNumbers.OK);
		expect(body.data).toHaveProperty("secret");
	});

	it("2. TOTP is already enabled", async () => {
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
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		await User.findOneAndUpdate({ _id: user.id }, { $set: { isTOTPEnabled: true } });

		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: "Sorry, you already enabled TOTP!",
		});
	});

	it("3. Re-initiate TOTP enabling", async () => {
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
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body.success).toBe(true);
		expect(body.status).toBe(httpStatusCodeNumbers.OK);
		expect(body.code).toBe(httpStatusCodeNumbers.OK);
		expect(body.data).toHaveProperty("secret");
	});

	it("4. Initiate TOTP route is private", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(httpStatusCodeNumbers.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNAUTHORIZED,
			code: httpStatusCodeStrings.UNAUTHORIZED,
			message: "Sorry, the access token is required!",
		});
	});
});
