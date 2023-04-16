const { success } = require("../../Exceptions/responseHandler");
const STATUS = require("../../constants/statusCodes");
const CODE = require("../../constants/errorCodes");

const validate = require("../../helpers/validate");

const AuthValidators = require("./auth.validators");
const AuthServices = require("./auth.services");

class AuthControllers {
	static async signUp(req, res, next) {
		const accountData = await validate(AuthValidators.signUp, req.body);

		const result = await AuthServices.signUp(accountData);

		return success({
			res,
			result,
			status: STATUS.CREATED,
			code: CODE.CREATED,
		});
	}

	static async verify(req, res, next) {
		const { verificationToken } = await validate(AuthValidators.verify, req.params);

		const result = await AuthServices.verify(verificationToken);

		return success({ res, result });
	}

	static async logIn(req, res, next) {
		const accountData = await validate(AuthValidators.login, req.body);

		const result = await AuthServices.logIn(accountData);

		return success({ res, result });
	}

	static async logOut(req, res, next) {
		const result = await AuthServices.logOut({
			accountId: req.accountId,
			accessToken: req.accessToken,
		});

		return success({ res, result });
	}
}

module.exports = AuthControllers;