const validate = require("../../helpers/validateInput");

const AccountValidators = require("./account.validators");
const AccountServices = require("./account.services");

class AccountControllers {
	static async deactivate(req, res, next) {
		req.result = await AccountServices.deactivate(req.accountId);

		next();
	}

	static async initiateActivation(req, res, next) {
		const { email } = await validate(AccountValidators.activate, req.body);

		req.result = await AccountServices.initiateActivation(email);

		next();
	}

	static async confirmActivation(req, res, next) {
		const { activationToken } = await validate(AccountValidators.confirmActivation, req.params);

		req.result = await AccountServices.confirmActivation(activationToken);

		next();
	}

	static async terminate(req, res, next) {
		req.result = await AccountServices.terminate(req.accountId);

		next();
	}

	static async cancelTermination(req, res, next) {
		req.result = await AccountServices.cancelTermination(req.accountId);

		next();
	}
}

module.exports = AccountControllers;
