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
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "tesTES@!#1212",
				confirmNewPassword: "tesTES@!#1212",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		// (5) Our expectations
		expect(status).toBe(200);
		expect(body.data).toBe("Password changed successfully");
	});

	it("2. Given password is wrong", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body, error } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#34",
				newPassword: "tesTES@!#1212",
				confirmNewPassword: "tesTES@!#1212",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		// (5) Our expectations
		expect(status).toBe(401);
		expect(body.data).toBe("Sorry, the password is invalid!");
	});

	it("3. newPassword and confirmNewPassword fields don't match", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#234",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			`"confirmNewPassword" field doesn't match "password" field`
		);
	});

	//==============================================================

	it("4. No user inputs are provided at all", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`);

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data.length).toEqual(3);
	});

	it("5. oldPassword field is not provided", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ newPassword: "tesTES@!#12", confirmNewPassword: "tesTES@!#12" });

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"oldPassword" field is required!');
	});

	it("6. newPassword field is not provided", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ oldPassword: "tesTES@!#12", confirmNewPassword: "tesTES@!#12" });

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe('"newPassword" field is required!');
		expect(body.data[1]).toBe(
			`"confirmNewPassword" field doesn't match "password" field`
		);
	});

	it("7. confirmNewPassword field is not provided", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ oldPassword: "tesTES@!#12", newPassword: "tesTES@!#12" });

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		// (5) Our expectations
		expect(status).toBe(422);
		expect(body.data[0]).toBe('"confirmNewPassword" is required');
	});

	//==============================================================

	it("8. oldPassword field is not of type string", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: 1234234,
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"oldPassword" field has to be of type string!');
		expect(body.data.length).toEqual(1);
	});

	it("9. oldPassword field is too short to be true", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "12",
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(2);
		expect(body.data[0]).toBe(
			`"oldPassword" field can't be less than 8 characters!`
		);
		expect(body.data[1]).toBe(
			'"oldPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)'
		);
	});

	it("10. oldPassword field is too long to be true", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "12".repeat(100),
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(2);
		expect(body.data[0]).toBe(
			`"oldPassword" field can't be more than 16 characers!`
		);
		expect(body.data[1]).toBe(
			'"oldPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)'
		);
	});

	it("11. oldPassword field can't be empty", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "",
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(1);
		expect(body.data[0]).toBe(`"oldPassword" field can't be empty!`);
	});

	it("12. oldPassword field pattern is invalid", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tttttttttt",
				newPassword: "tesTES@!#12",
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe(
			'"oldPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)'
		);
	});

	//==============================================================
	it("13. newPassword field is not of type string", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: 1234234,
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data[0]).toBe('"newPassword" field has to be of type string!');
		expect(body.data[1]).toBe(
			`"confirmNewPassword" field doesn't match "password" field`
		);
		expect(body.data.length).toEqual(2);
	});

	it("14. newPassword field is too short to be true", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "12",
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(3);
		expect(body.data[0]).toBe(
			`"newPassword" field can't be less than 8 characters!`
		);
		expect(body.data[1]).toBe(
			'"newPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)'
		);
		expect(body.data[2]).toBe(
			`"confirmNewPassword" field doesn't match "password" field`
		);
	});

	it("15. newPassword field is too long to be true", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "1".repeat(100),
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(3);
		expect(body.data[0]).toBe(
			`"newPassword" field can't be more than 16 characers!`
		);
		expect(body.data[1]).toBe(
			'"newPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)'
		);
		expect(body.data[2]).toBe(
			`"confirmNewPassword" field doesn't match "password" field`
		);
	});

	it("16. newPassword field can't be empty", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "",
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data.length).toEqual(2);
		expect(body.data[0]).toBe(`"newPassword" field can't be empty!`);
		expect(body.data[1]).toBe(
			`"confirmNewPassword" field doesn't match "password" field`
		);
	});

	it("17. newPassword field pattern is invalid", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "testtest",
				confirmNewPassword: "tesTES@!#12",
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data.length).toBe(2);
		expect(body.data[0]).toBe(
			'"newPassword" field must include at least(2 upper, 2 lower characters, 2 numbers and 2 special characters)'
		);
		expect(body.data[1]).toBe(
			`"confirmNewPassword" field doesn't match "password" field`
		);
	});

	//==============================================================

	it("18. confirmNewPassword is not of type string", async () => {
		// (1) Create and save a fake user
		const user = await User.create({
			email: faker.internet.email(),
			userName: faker.random.alpha(10),
			isVerified: true,
			isActive: true,
			password: await generate_hash("tesTES@!#12"),
		});

		// (2) Log user In to have needed accessToken
		const {
			body: {
				data: { accessToken },
			},
		} = await request(app)
			.post("/auth/login")
			.send({ email: user.email, password: "tesTES@!#12" });

		// (3) Change password
		const { status, body } = await request(app)
			.put(baseURL)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				oldPassword: "tesTES@!#12",
				newPassword: "tesTES@!#34",
				confirmNewPassword: 112341234,
			});

		// (4) clean DB
		await User.findOneAndDelete({ _id: user._id });
		await Session.findOneAndDelete({
			userId: user._id,
			accessToken,
		});

		expect(status).toBe(422);
		expect(body.data.length).toBe(2);
		expect(body.data[0]).toBe(
			`"confirmNewPassword" field doesn't match "password" field`
		);
		expect(body.data[1]).toBe('"confirmNewPassword" must be a string');
	});
});
