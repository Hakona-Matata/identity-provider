const { success } = require("../../Exceptions/responseHandler");

const validate = require("./../../helpers/validate");

const AccountValidators = require("./account.validators");
const AccountServices = require("./account.services");

class AccountControllers {
	static async deactivate(req, res, next) {
		const result = await AccountServices.deactivate(req.accountId);

		return success({ res, result });
	}

	static async initiateActivation(req, res, next) {
		const { email } = await validate(AccountValidators.activate, req.body);

		const result = await AccountServices.initiateActivation(email);

		return success({ result, res });
	}

	static async confirmActivation(req, res, next) {
		const { activationToken } = await validate(AccountValidators.confirmActivation, req.params);

		const result = await AccountServices.confirmActivation(activationToken);

		return success({ res, result });
	}

	static async terminate(req, res, next) {
		const result = await AccountServices.terminate(req.accountId);

		return success({ res, result });
	}

	static async cancelTermination(req, res, next) {
		const result = await AccountServices.cancelTermination(req.accountId);

		return success({ res, result });
	}
}

module.exports = AccountControllers;
