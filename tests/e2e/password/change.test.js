const STATUS = require("./../../../src/constants/statusCodes");
const CODE = require("./../../../src/constants/errorCodes");

const request = require("supertest");
const { faker } = require("@faker-js/faker");

const { connect, disconnect } = require("../../db.config");
const app = require("../../../src/server");
const { generate_hash } = require("./../../../src/helpers/hash");

const User = require("./../../../src/app/Models/User.model");
const Session = require("./../../../src/app/Models/Session.model");

const baseURL = "/auth/password/change";

beforeAll(async () => {
	return await connect();
});

afterAll(async () => {
	return await disconnect();
});

describe(`"PUT" ${baseURL} - Change Password`, () => {
	it("1. Change user password successfully", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "tesTES@!#1212",
				confirmNewPassword: "tesTES@!#1212",
			});

		expect(status).toBe(STATUS.OK);
		expect(body).toEqual({
			success: true,
			status: STATUS.OK,
			code: CODE.OK,
			data: "Password changed successfully!",
		});
	});

	it("2. Given password is wrong", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#34",
				newPassword: "tesTES@!#1212",
				confirmNewPassword: "tesTES@!#1212",
			});

		expect(status).toBe(STATUS.UNAUTHORIZED);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNAUTHORIZED,
			code: CODE.UNAUTHORIZED,
			message: "Sorry, the given password is incorrect!",
		});
	});

	//==============================================================

	it("3. newPassword and confirmNewPassword fields don't match", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#234",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"confirmNewPassword" field doesn't match "password" field`],
		});
	});

	it("4. No user inputs are provided at all", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				'"oldPassword" field is required!',
				'"newPassword" field is required!',
				'"confirmNewPassword" is required',
			],
		});
	});

	it("5. oldPassword field is not provided", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ newPassword: "tesTES@!#12", confirmNewPassword: "tesTES@!#12" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"oldPassword" field is required!'],
		});
	});

	it("6. newPassword field is not provided", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ oldPassword: "tesTES@!#12", confirmNewPassword: "tesTES@!#12" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				'"newPassword" field is required!',
				`"confirmNewPassword" field doesn't match "password" field`,
			],
		});
	});

	it("7. confirmNewPassword field is not provided", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ oldPassword: "tesTES@!#12", newPassword: "tesTES@!#12" });

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"confirmNewPassword" is required'],
		});
	});

	//==============================================================

	it("8. oldPassword field is not of type string", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: 1234234,
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: ['"oldPassword" field has to be of type string!'],
		});
	});

	it("9. oldPassword field is too short to be true", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "12",
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"oldPassword" field can't be less than 8 characters!`,
				'"oldPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
			],
		});
	});

	it("10. oldPassword field is too long to be true", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "12".repeat(100),
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"oldPassword" field can't be more than 16 characers!`,
				'"oldPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
			],
		});
	});

	it("11. oldPassword field can't be empty", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "",
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [`"oldPassword" field can't be empty!`],
		});
	});

	it("12. oldPassword field pattern is invalid", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tttttttttt",
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				'"oldPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
			],
		});
	});

	//==============================================================
	it("13. newPassword field is not of type string", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: 1234234,
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				'"newPassword" field has to be of type string!',
				`"confirmNewPassword" field doesn't match "password" field`,
			],
		});
	});

	it("14. newPassword field is too short to be true", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "12",
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"newPassword" field can't be less than 8 characters!`,
				'"newPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
				`"confirmNewPassword" field doesn't match "password" field`,
			],
		});
	});

	it("15. newPassword field is too long to be true", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "1".repeat(100),
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"newPassword" field can't be more than 16 characers!`,
				'"newPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
				`"confirmNewPassword" field doesn't match "password" field`,
			],
		});
	});

	it("16. newPassword field can't be empty", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "",
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"newPassword" field can't be empty!`,
				`"confirmNewPassword" field doesn't match "password" field`,
			],
		});
	});

	it("17. newPassword field pattern is invalid", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "testtest",
				confirmNewPassword: "tesTES@!#12",
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				'"newPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)',
				`"confirmNewPassword" field doesn't match "password" field`,
			],
		});
	});

	//==============================================================

	it("18. confirmNewPassword is not of type string", async () => {
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "tesTES@!#34",
				confirmNewPassword: 112341234,
			});

		expect(status).toBe(STATUS.UNPROCESSABLE_ENTITY);
		expect(body).toEqual({
			success: false,
			status: STATUS.UNPROCESSABLE_ENTITY,
			code: CODE.UNPROCESSABLE_ENTITY,
			message: [
				`"confirmNewPassword" field doesn't match "password" field`,
				'"confirmNewPassword" must be a string',
			],
		});
	});
});
