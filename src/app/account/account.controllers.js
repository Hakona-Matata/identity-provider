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

	static async confirmVerification(req, res, next) {
		const { verificationToken } = await validate(AccountValidators.confirmVerification, req.params);

		const result = await AccountServices.confirmVerification(verificationToken);

		return success({ res, result });
	}

	static async logIn(req, res, next) {
		const accountData = await validate(AccountValidators.login, req.body);

		const result = await AccountServices.logIn(accountData);

		return success({ res, result });
	}

	static async logOut(req, res, next) {
		const result = await AccountServices.logOut({
			accountId: req.accountId,
			accessToken: req.accessToken,
		});

		return success({ res, result });
	}

	static async deactivate(req, res, next) {
		const result = await AccountServices.deactivate(req.accountId);

		return success({ res, result });
	}

	static async activate(req, res, next) {
		const { email } = await validate(AccountValidators.activate, req.body);

		const result = await AccountServices.activate(email);

		return success({ result, res });
	}

	static async confirmActivation(req, res, next) {
		const { activationToken } = await validate(AccountValidators.confirmActivation, req.params);

		const result = await AccountServices.confirmActivation(activationToken);

		return success({ res, result });
	}
}

module.exports = AccountControllers;
