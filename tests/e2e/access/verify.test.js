const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");

const baseURL = "/auth/verify-email";
const testVerificationToken = {
	valid:
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDBmOTQwYjBiMWRjM2JkNGY4YjZkOGQiLCJpYXQiOjE2Nzg3NDI1MzksImV4cCI6MTY3ODgyODkzOX0.Zog3yvD5zoRZfsdqTfktzuMCXs1P_8jMmpSt5L637p5",
	short: "12",
	long: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDBmOTQwYjBiMWRjM2JkNGY4YjZkOGQiLCJpYXQiOjE2Nzg3NDI1MzksImV4cCI6MTY3ODgyODkzOX0.Zog3yvD5zoRZfsdqTfktzuMCXs1P_8jMmpSt5L637p522222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222",
};

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"GET" ${baseURL} - Verify user email after sign up"`, () => {
	it("1. Check verification token presence", async () => {
		const { status } = await request(app).get(
			baseURL + `/${testVerificationToken.valid}`
		);

		expect(status).toBe(401);
	});

	it("2. Verification token isn't string", async () => {
		const { status, body } = await request(app).get(baseURL + `/` + 1);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"verificationToken" param can't be true!`);
	});

	it("3. Verification token isn't provided", async () => {
		const { status, body } = await request(app).get(baseURL + `/`);

		// This means the route it self is not found!
		expect(status).toBe(404);
	});

	it("4. Verification token is too short to be true", async () => {
		const { status, body } = await request(app).get(
			baseURL + `/${testVerificationToken.short}`
		);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"verificationToken" param can't be true!`);
	});

	it("5. Verification token is too long to be true", async () => {
		const { status, body } = await request(app).get(
			baseURL + `/${testVerificationToken.long}`
		);

		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"verificationToken" param can't be true!`);
	});
});
