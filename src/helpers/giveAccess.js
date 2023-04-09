const { generate_token } = require("./token");
const Session = require("./../app/Models/Session.model");
const CustomError = require("../Exceptions/CustomError");

const STATUS = require("./../constants/statusCodes");
const CODE = require("./../constants/errorCodes");

const { sendOTP_POST_service } = require("./../app/Services/OTP.services");
const { sendSMS_POST_service } = require("./../app/Services/SMS.services");

module.exports = async ({ user }) => {
	const enabledSecurityMethods = [];

	if (user.isOTPEnabled) {
		enabledSecurityMethods.push({ isOTPEnabled: true });
	}

	if (user.isSMSEnabled) {
		enabledSecurityMethods.push({ isSMSEnabled: true });
	}

	if (user.isTOTPEnabled) {
		enabledSecurityMethods.push({ isTOTPEnabled: true });
	}

	if (enabledSecurityMethods.length > 1) {
		return {
			message: "Please, choose one of these security methods!",
			userId: user._id,
			methods: enabledSecurityMethods,
		};
	}

	if (enabledSecurityMethods.length === 1) {
		return await give_access_one_security_layer_enabled({
			user,
			enabledSecurityMethods,
		});
	}

	return await give_access_no_security_layers_enabled({ userId: user._id });
};

//============================================================================

const generate_access_refresh_token = async ({ payload }) => {
	const accessToken = await generate_token({
		payload,
		secret: process.env.ACCESS_TOKEN_SECRET,
		expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
	});

	const refreshToken = await generate_token({
		payload,
		secret: process.env.REFRESH_TOKEN_SECRET,
		expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
	});

	return {
		accessToken,
		refreshToken,
	};
};

const give_access_no_security_layers_enabled = async ({ userId }) => {
	const { accessToken, refreshToken } = await generate_access_refresh_token({
		payload: { _id: userId },
	});

	const isSessionCreated = await Session.create({
		userId,
		accessToken,
		refreshToken,
	});

	if (!isSessionCreated) {
		throw new CustomError({
			status: STATUS.INTERNAL_SERVER_ERROR,
			code: CODE.INTERNAL_SERVER_ERROR,
			message: "Sorry, the login attempt failed!",
		});
	}

	return {
		accessToken,
		refreshToken,
	};
};

const give_access_one_security_layer_enabled = async ({
	user,
	enabledSecurityMethods,
}) => {
	const enabledMethodName = Object.keys(enabledSecurityMethods[0])[0];

	switch (enabledMethodName) {
		case "isOTPEnabled":
			return await sendOTP_POST_service({
				userId: user._id,
				email: user.email,
			});

		case "isSMSEnabled":
			return await sendSMS_POST_service({ userId: user._id });

		default:
			return "Sorry, something went wrong with the login process!";
	}
};
