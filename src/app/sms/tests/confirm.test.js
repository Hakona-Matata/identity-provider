const { httpStatusCodeNumbers, httpStatusCodeStrings } = require("./../../../constants");
const {
	SUCCESS_MESSAGES: { SMS_ENABLED_SUCCESSFULLY },
	FAILURE_MESSAGES: { EXPIRED_SMS },
} = require("./../sms.constants");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { app } = require("../../../app");

const AccountServices = require("./../../account/account.services");
const SmsServices = require("./../sms.services");

const { RandomGenerator, HashHelper } = require("./../../../helpers");

const baseURL = "/auth/account/sms/confirm";

describe(`Auth API - Confirm enabling SMS endpoint"${baseURL}"`, () => {
	const generateFakeAccount = () => {
		return {
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			phone: "+201210101010",
			password: "tesTES@!#1232",
			role: "CANDIDATE",
		};
	};

	it("Should return 200 status code when confirm enabling SMS is done successfully", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const plainTextOtp = RandomGenerator.generateRandomNumber(6);
		const hashedOtp = await HashHelper.generate(plainTextOtp);
		await SmsServices.createOne({ accountId: account._id, hashedOtp });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: plainTextOtp.toString() });

		expect(status).toBe(httpStatusCodeNumbers.OK);
		expect(body).toEqual({
			success: true,
			status: httpStatusCodeNumbers.OK,
			code: httpStatusCodeStrings.OK,
			result: SMS_ENABLED_SUCCESSFULLY,
		});
	});

	it("Should return 403 status code when otp code is expired", async () => {
		const fakeAccount = generateFakeAccount();

		const account = await AccountServices.createOne({
			...fakeAccount,
		});

		const {
			body: {
				result: { accessToken },
			},
		} = await request(app).post("/auth/login").send({ email: account.email, password: fakeAccount.password });

		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "234234" });

		expect(status).toBe(httpStatusCodeNumbers.FORBIDDEN);
		expect(body).toEqual({
			success: false,
			status: httpStatusCodeNumbers.FORBIDDEN,
			code: httpStatusCodeStrings.FORBIDDEN,
			message: EXPIRED_SMS,
		});
	});

	it.only("3. OTP code is invalid", async () => {
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

		// (3) Generate OTP | 6 random numbers
		const plainTextOTP = generate_randomNumber({ length: 6 });

		// (4) Hash generated OTP!
		const hashedOTP = await generate_hash(`${plainTextOTP}`);

		// (4) Save OTP
		await OTP.create({ userId: user.id, otp: hashedOTP, by: "SMS" });

		// (5) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: 123123 });

		// (6) Clean DB

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await OTP.findOneAndDelete({ userId: user.id, by: "SMS" });

		// (7) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, your OTP is invalid!");
	});

	it("4. More than 3 times invalid OTP code", async () => {
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

		// (3) Generate OTP | 6 random numbers
		const plainTextOTP = generate_randomNumber({ length: 6 });

		// (4) Hash generated OTP!
		const hashedOTP = await generate_hash(`${plainTextOTP}`);

		// (4) Save OTP
		await OTP.create({ userId: user.id, otp: hashedOTP, by: "SMS", count: 3 });

		// (5) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: 123123 });

		// (6) Clean DB

		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });
		await OTP.findOneAndDelete({ userId: user.id, by: "SMS" });

		// (7) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, You have reached your maximum wrong tries!");
	});

	it("5. Route is private", async () => {
		const { status, body } = await request(app).post(baseURL);

		expect(status).toBe(404);
		expect(body.data).toBe("Sorry, access token is not found");
	});

	//====================================================
	it("6. OTP code is not provided", async () => {
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

		// (3) Confirm OTP
		const { status, body } = await request(app).post(baseURL).set("Authorization", `Bearer ${accessToken}`);

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field is required!`);
	});

	it("7. OTP code has to be of type number", async () => {
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

		// (3) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: "" });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be of type number!`);
	});

	it("8. OTP code has to be integer", async () => {
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

		// (3) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: +"11.2233" });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be integer!`);
	});

	it("9. OTP code has to be positive", async () => {
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

		// (3) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: -123123 });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be positive!`);
	});

	it("10. OTP code is too short to be true", async () => {
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

		// (3) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: 123 });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be 6 digits!`);
	});

	it("11. OTP code is too long to be true", async () => {
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

		// (3) Confirm OTP
		const { status, body } = await request(app)
			.post(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ otp: 123123123 });

		// (4) Clean DB
		await User.findOneAndDelete({ _id: user.id });
		await Session.findOneAndDelete({ userId: user.id, accessToken });

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(`"otp" field has to be 6 digits!`);
	});
});
