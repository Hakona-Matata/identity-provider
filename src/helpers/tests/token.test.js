const jwt = require("jsonwebtoken");
const TokenHelper = require("./../token");
const {
	IDENTITY_PROVIDER,
	tokens: { VERIFICATION_TOKEN, ACCESS_TOKEN, REFRESH_TOKEN, RESET_TOKEN, ACTIVATION_TOKEN },
} = require("./../../constants/index");

describe("TokenHelper", () => {
	const accountId = "fakeAccountId";
	const role = "fakeRole";

	describe("generateVerificationToken", () => {
		it("should generate a verification token with the correct payload", async () => {
			jwt.sign = jest.fn().mockImplementation(() => "fakeToken");

			const token = await TokenHelper.generateVerificationToken({ accountId, role });

			expect(jwt.sign).toHaveBeenCalledWith(
				{
					accountId,
					role,
					label: VERIFICATION_TOKEN,
					origin: IDENTITY_PROVIDER,
				},
				process.env.VERIFICATION_TOKEN_SECRET,
				{
					expiresIn: process.env.VERIFICATION_TOKEN_EXPIRES_IN,
				}
			);

			expect(token).toBe("fakeToken");
		});
	});

	describe("verifyVerificationToken", () => {
		it("should verify a valid verification token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				return {
					accountId,
					role,
					label: VERIFICATION_TOKEN,
					origin: IDENTITY_PROVIDER,
				};
			});

			const verificationToken = await TokenHelper.generateVerificationToken({
				accountId,
				role,
			});

			const decoded = await TokenHelper.verifyVerificationToken(verificationToken);

			expect(jwt.verify).toHaveBeenCalledWith(verificationToken, process.env.VERIFICATION_TOKEN_SECRET);

			expect(decoded).toEqual({
				accountId,
				role,
				label: VERIFICATION_TOKEN,
				origin: IDENTITY_PROVIDER,
			});
		});

		it("should throw an error for an invalid verification token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				throw new Error("invalid token");
			});

			const verificationToken = await TokenHelper.generateVerificationToken({
				accountId,
				role,
			});

			await expect(TokenHelper.verifyVerificationToken(verificationToken)).rejects.toThrow("invalid token");

			expect(jwt.verify).toHaveBeenCalledWith(verificationToken, process.env.VERIFICATION_TOKEN_SECRET);
		});

		it("should throw an error for an expired verification token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				const error = new Error("jwt expired");
				error.name = "TokenExpiredError";
				throw error;
			});

			const verificationToken = await TokenHelper.generateVerificationToken({
				accountId,
				role,
			});

			await expect(TokenHelper.verifyVerificationToken(verificationToken)).rejects.toThrow("jwt expired");

			expect(jwt.verify).toHaveBeenCalledWith(verificationToken, process.env.VERIFICATION_TOKEN_SECRET);
		});
	});

	describe("generateAccessRefreshTokens", () => {
		it("should generate access and refresh tokens with the correct payload", async () => {
			jwt.sign = jest.fn().mockImplementation(() => "created fake token");

			const { accessToken, refreshToken } = await TokenHelper.generateAccessRefreshTokens({ accountId, role });

			expect(jwt.sign).toHaveBeenCalledWith(
				{
					accountId,
					role,
					origin: IDENTITY_PROVIDER,
					label: ACCESS_TOKEN,
				},
				process.env.ACCESS_TOKEN_SECRET,
				{
					expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
				}
			);

			expect(jwt.sign).toHaveBeenCalledWith(
				{
					accountId,
					role,
					origin: IDENTITY_PROVIDER,
					label: REFRESH_TOKEN,
				},
				process.env.REFRESH_TOKEN_SECRET,
				{
					expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
				}
			);

			expect(accessToken).toBe("created fake token");
			expect(refreshToken).toBe("created fake token");
		});
	});

	describe("verifyAccessToken", () => {
		it("should return the decoded access token if it is valid", async () => {
			const { accessToken } = await TokenHelper.generateAccessRefreshTokens({ accountId, role });

			jwt.verify = jest.fn().mockReturnValue({ accountId, role });

			const decodedToken = await TokenHelper.verifyAccessToken(accessToken);

			expect(jwt.verify).toHaveBeenCalledWith(accessToken, process.env.ACCESS_TOKEN_SECRET);
			expect(decodedToken).toEqual({ accountId, role });
		});

		it("should throw an error if the access token is invalid", async () => {
			const { accessToken } = await TokenHelper.generateAccessRefreshTokens({ accountId, role });

			jwt.verify = jest.fn().mockImplementation(() => {
				throw new Error("Invalid token");
			});

			await expect(TokenHelper.verifyAccessToken(accessToken)).rejects.toThrow("Invalid token");

			expect(jwt.verify).toHaveBeenCalledWith(accessToken, process.env.ACCESS_TOKEN_SECRET);
		});

		it("should throw an error for an expired access token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				const error = new Error("jwt expired");
				error.name = "TokenExpiredError";
				throw error;
			});

			const accessToken = await TokenHelper.generateResetToken({
				accountId,
				role,
			});

			await expect(TokenHelper.verifyAccessToken(accessToken)).rejects.toThrow("jwt expired");

			expect(jwt.verify).toHaveBeenCalledWith(accessToken, process.env.ACCESS_TOKEN_SECRET);
		});
	});

	describe("verifyRefreshToken", () => {
		it("should return the decoded refresh token if it is valid", async () => {
			const refreshToken = "valid refresh token";

			// Mock the jwt.verify method
			jwt.verify = jest.fn().mockReturnValue({ accountId, role });

			const decodedToken = await TokenHelper.verifyRefreshToken(refreshToken);

			expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			expect(decodedToken).toEqual({ accountId, role });
		});

		it("should throw an error if the refresh token is invalid", async () => {
			const refreshToken = "invalid refresh token";

			// Mock the jwt.verify method to throw an error
			jwt.verify = jest.fn().mockImplementation(() => {
				throw new Error("Invalid token");
			});

			await expect(TokenHelper.verifyRefreshToken(refreshToken)).rejects.toThrow("Invalid token");
			expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		});

		it("should throw an error for an expired access token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				const error = new Error("jwt expired");
				error.name = "TokenExpiredError";
				throw error;
			});

			const { refreshToken } = await TokenHelper.generateAccessRefreshTokens({
				accountId,
				role,
			});

			await expect(TokenHelper.verifyResetToken(refreshToken)).rejects.toThrow("jwt expired");

			expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		});
	});

	describe("generateResetToken", () => {
		it("should generate a reset token with the correct payload", async () => {
			jwt.sign.mockImplementation(() => "created fake reset token");

			const resetToken = await TokenHelper.generateResetToken({ accountId, role });

			expect(jwt.sign).toHaveBeenCalledWith(
				{
					accountId,
					role,
					label: "RESET_TOKEN",
					origin: IDENTITY_PROVIDER,
				},
				process.env.RESET_TOKEN_SECRET,
				{
					expiresIn: process.env.RESET_TOKEN_EXPIRES_IN,
				}
			);

			expect(resetToken).toBe("created fake reset token");
		});
	});

	describe("verifyResetToken", () => {
		it("should verify a valid reset token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				return {
					accountId,
					role,
					label: RESET_TOKEN,
					origin: IDENTITY_PROVIDER,
				};
			});

			const resetToken = await TokenHelper.generateResetToken({
				accountId,
				role,
			});

			const decoded = await TokenHelper.verifyResetToken(resetToken);

			expect(jwt.verify).toHaveBeenCalledWith(resetToken, process.env.RESET_TOKEN_SECRET);

			expect(decoded).toEqual({
				accountId,
				role,
				label: RESET_TOKEN,
				origin: IDENTITY_PROVIDER,
			});
		});

		it("should throw an error for an expired reset token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				const error = new Error("jwt expired");
				error.name = "TokenExpiredError";
				throw error;
			});

			const resetToken = await TokenHelper.generateResetToken({
				accountId,
				role,
			});

			await expect(TokenHelper.verifyResetToken(resetToken)).rejects.toThrow("jwt expired");

			expect(jwt.verify).toHaveBeenCalledWith(resetToken, process.env.RESET_TOKEN_SECRET);
		});

		it("should throw an error for an invalid reset token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				throw new Error("invalid token");
			});

			const resetToken = "invalid-token";

			await expect(TokenHelper.verifyResetToken(resetToken)).rejects.toThrow("invalid token");

			expect(jwt.verify).toHaveBeenCalledWith(resetToken, process.env.RESET_TOKEN_SECRET);
		});
	});

	describe("generateActivationToken", () => {
		it("should generate a activation token with the correct payload", async () => {
			jwt.sign.mockImplementation(() => "created fake activation token");

			const activationToken = await TokenHelper.generateActivationToken({ accountId, role });

			expect(jwt.sign).toHaveBeenCalledWith(
				{
					accountId,
					role,
					label: ACTIVATION_TOKEN,
					origin: IDENTITY_PROVIDER,
				},
				process.env.ACTIVATION_TOKEN_SECRET,
				{
					expiresIn: process.env.ACTIVATION_TOKEN_EXPIRES_IN,
				}
			);

			expect(activationToken).toBe("created fake activation token");
		});
	});

	describe("verifyActivationToken", () => {
		it("should verify a valid activation token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				return {
					accountId,
					role,
					label: ACTIVATION_TOKEN,
					origin: IDENTITY_PROVIDER,
				};
			});

			const activationToken = await TokenHelper.generateActivationToken({
				accountId,
				role,
			});

			const decoded = await TokenHelper.verifyActivationToken(activationToken);

			expect(jwt.verify).toHaveBeenCalledWith(activationToken, process.env.ACTIVATION_TOKEN_SECRET);

			expect(decoded).toEqual({
				accountId,
				role,
				label: ACTIVATION_TOKEN,
				origin: IDENTITY_PROVIDER,
			});
		});

		it("should throw an error for an expired activation token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				const error = new Error("jwt expired");
				error.name = "TokenExpiredError";
				throw error;
			});

			const activationToken = await TokenHelper.generateActivationToken({
				accountId,
				role,
			});

			await expect(TokenHelper.verifyResetToken(activationToken)).rejects.toThrow("jwt expired");

			expect(jwt.verify).toHaveBeenCalledWith(activationToken, process.env.ACTIVATION_TOKEN_SECRET);
		});

		it("should throw an error for an invalid activation token", async () => {
			jwt.verify = jest.fn().mockImplementation(() => {
				throw new Error("invalid token");
			});

			const activationToken = await TokenHelper.generateActivationToken({
				accountId,
				role,
			});

			await expect(TokenHelper.verifyActivationToken(activationToken)).rejects.toThrow("invalid token");

			expect(jwt.verify).toHaveBeenCalledWith(activationToken, process.env.ACTIVATION_TOKEN_SECRET);
		});
	});
});
