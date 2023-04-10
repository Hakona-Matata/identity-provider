const { success } = require("../../Exceptions/responseHandler");
const STATUS = require("./../../constants/statusCodes");
const CODE = require("./../../constants/errorCodes");

const validate = require("./../../helpers/validate");

const AccountValidators = require("./account.validators");
const AccountServices = require("./account.services");

class AccountControllers {
	static async signUp(req, res, next) {
		const accountData = await validate(AccountValidators.signUp, req.body);

		const result = await AccountServices.signUp(accountData);

		return success({
			res,
			result,
			status: STATUS.CREATED,
			code: CODE.CREATED,
		});
	}

	static async verify(req, res, next) {
		const { verificationToken } = await validate(AccountValidators.verify, req.params);

		const result = await AccountServices.verify(verificationToken);

		return success({ res, result });
	}

	static async logIn(req, res, next) {
		const accountData = await validate(AccountValidators.login, req.body);

		const result = await AccountServices.logIn(accountData);

		return success({ res, result });
	}

	static async logOut(req, res, next) {
		const result = await AccountServices.logOut({
			userId: req.userId,
			accessToken: req.accessToken,
		});

		return success({ res, result });
	}
}

module.exports = AccountControllers;
