const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("../../../constants/index");
const {
	SUCCESS_MESSAGES: { BACKUP_ENABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: { BACKUP_ALREADY_ENABLED, INVALID_BACKUP },
} = require("../backup.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");
const BackupServices = require("./../backup.services");

const baseURL = "/auth/account/backup/confirm";

describe(`Auth API - Confirm enabling Backup endpoint "${baseURL}"`, () => {
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

	it("Should return 200 status code when confirm enabling Backup codes is done successfully", async () => {
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

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: codes[0] });

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: BACKUP_ENABLED_SUCCESSFULLY,
		});
	});

	it("Should return 403 status code when backup codes feature is already enabled", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		await AccountServices.updateOne({ _id: account._id }, { isBackupEnabled: true });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: "1234512345123456" });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: BACKUP_ALREADY_ENABLED,
		});
	});

	it.only("Should return 403 status code when given backup code is invalid", async () => {
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

		await request(app).post("/auth/account/backup/initiate").set("Authorization", `Bearer ${accessToken}`);

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: "1234512345123451" });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: INVALID_BACKUP,
		});
	});

	it("4. Invalid backup code", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Enable at least one 2FA method
		await User.findOneAndUpdate({ _id: user.id }, { $set: { isOTPEnabled: true } });

		// (4) Generate backup codes
		await request(app).post("/auth/backup/generate").set("Authorization", `Bearer ${accessToken}`);

		// (5) Conirm Backup codes
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: 123451234512 });

		// (6) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await Backup.deleteMany({ userId: user.id });

		// (7) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, backup code is invalid!");
	});

	it("5. Backup codes route is private", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});

	it("6. Backup code is not provided", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Confirm backup code
		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field is required!`);
	});

	it("7. Backup code has to be of type number", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Confirm backup code
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: "" });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe('"code" field has to be of type number!');
	});

	it("8. Backup code has to be of type integer", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Confirm backup code
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: 22.1234512345 });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field has to be integer!`);
	});

	it("9. Backup code has to be positive", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Confirm backup code
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: -221234512345 });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field has to be positive!`);
	});

	it("10. Backup code is too short to be true", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Confirm backup code
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ code: 22125 });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field has to be 12 digits!`);
	});

	it("11. Backup code is too long to be true", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#1232"),
		});

		// (2) Log user In to get needed tokens
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: user.email, password: "tesTES@!#1232" });

		// (3) Confirm backup code
		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);
		// .send({ code: 123423424221234512345 });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"code" field has to be 12 digits!`);
	});
});
