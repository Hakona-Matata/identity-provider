const { success } = require("./../../../Errors/responseHandler");
const STATUS = require("./../../../constants/statusCodes");
const CODE = require("./../../../constants/errorCodes");

const validate = require("./../../../helpers/validate");

const CandidateValidators = require("./candidate.validators");
const CandidateServices = require("./candidate.services");

class CandidateControllers {
	static async signUp(req, res, next) {
		const userData = await validate(CandidateValidators.signUp, req.body);

		const result = await CandidateServices.signUp(userData);

		return success({
			res,
			result,
			status: STATUS.CREATED,
			code: CODE.CREATED,
		});
	}

	static async verify(req, res, next) {
		const { verificationToken } = await validate(
			CandidateValidators.verify,
			req.params
		);

		const result = await CandidateServices.verify(verificationToken);

		return success({ res, result });
	}

	static async logIn(req, res, next) {}

	static async logOut() {}
}

module.exports = CandidateControllers;
