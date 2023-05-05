const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("../../../constants/index");
const {
	FAILURE_MESSAGES: { INVALID_BACKUP },
} = require("../backup.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");

const baseURL = "/auth/account/backup/verify";

describe(`Auth API - Verify Backup code endpoint during account recovery "${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			isDeleted: false,
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("should return 200 status code when backup code is verified successfully | Account Recovery", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isOtpEnabled: true });

		const {
			body: {
				result: { codes },
			},
		} = await request(app).post("/auth/account/backup/initiate").set("Authorization", `Bearer ${accessToken}`);

		await request(app)
			.post("/auth/account/backup/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: codes[0] });

		const { status, body } = await request(app).post(baseURL).send({ email: account.email, code: codes[1] });

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: "Please, check your mail box!",
		});
	});

	it("Should return 403 statuscode when backup code is invalid", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isOtpEnabled: true });

		const {
			body: {
				result: { codes },
			},
		} = await request(app).post("/auth/account/backup/initiate").set("Authorization", `Bearer ${accessToken}`);

		await request(app)
			.post("/auth/account/backup/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: codes[0] });

		const { status, body } = await request(app).post(baseURL).send({ email: account.email, code: codes[0] });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: INVALID_BACKUP,
		});
	});

	it("Should return 403 statuscode when email is not found in DB", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isOtpEnabled: true });

		const {
			body: {
				result: { codes },
			},
		} = await request(app).post("/auth/account/backup/initiate").set("Authorization", `Bearer ${accessToken}`);

		await request(app)
			.post("/auth/account/backup/confirm")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: codes[0] });

		await AccountServices.deleteOne({ _id: account._id });

		const { status, body } = await request(app).post(baseURL).send({ email: account.email, code: codes[0] });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: INVALID_BACKUP,
		});
	});

	it("Should return 403 statuscode when backup feature is not enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isOtpEnabled: true });

		const {
			body: {
				result: { codes },
			},
		} = await request(app).post("/auth/account/backup/initiate").set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app).post(baseURL).send({ email: account.email, code: codes[0] });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: INVALID_BACKUP,
		});
	});

	it("Should return 422 statuscode when email field is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ code: 123451234512 });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"email" field is required!']),
		});
	});

	it("Should return 422 statuscode when email field is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "", code: "1234512345123451" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"email" field is required!']),
		});
	});

	it("Should return 422 statuscode when email field is not of type string", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: 111111111111, code: "1234512345123451" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['Invalid type, expected a string for "email"!']),
		});
	});

	it("Should return 422 statuscode when email field is invalid", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: "testtesttesttest", code: "1234512345123451" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['Invalid email address for "email"!']),
		});
	});

	it("Should return 422 statuscode when email field is too short", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "t@test.com", code: "1234512345123451" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"email" field should have a minimum length of 15!']),
		});
	});

	it("Should return 422 statuscode when email field is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ email: `${"t".repeat(50)}@test.com`, code: "1234512345123451" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"email" field should have a maximum length of 40!']),
		});
	});

	it("Should return 422 status code when backup code is not provided", async () => {
		const { status, body } = await request(app).post(baseURL).send({ email: "test1234124@gmail.com" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"code" field is required!']),
		});
	});

	it("Should return 422 status code when backup code is empty", async () => {
		const { status, body } = await request(app).post(baseURL).send({ code: "", email: "test1234124@gmail.com" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"code" field is required!']),
		});
	});

	it("Should return 422 status code when backup code is not of type string", async () => {
		const { status, body } = await request(app).post(baseURL).send({ code: 12345, email: "test1234124@gmail.com" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining([`Invalid type, expected a string for "code"!`]),
		});
	});

	it("Should return 422 status code when backup code is too short", async () => {
		const { status, body } = await request(app).post(baseURL).send({ code: "22125", email: "test1234124@gmail.com" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"code" field should have a length of 16!']),
		});
	});

	it("Should return 422 status code when backup code is too long", async () => {
		const { status, body } = await request(app)
			.post(baseURL)
			.send({ code: "12345123423413423421234512", email: "test1234124@gmail.com" });

		expect(status).toBe(httpStatusCodeNumbers.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.UNPROCESSABLE_ENTITY,
			code: httpStatusCodeStrings.UNPROCESSABLE_ENTITY,
			message: expect.arrayContaining(['"code" field should have a length of 16!']),
		});
	});
});
