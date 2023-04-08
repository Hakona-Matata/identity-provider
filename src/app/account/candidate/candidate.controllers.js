const { success } = require("./../../../Errors/responseHandler");
const STATUS = require("./../../../constants/statusCodes");
const CODE = require("./../../../constants/errorCodes");

const validate = require("./../../../helpers/validate");
const CandidateValidators = require("./candidate.validators");
const CandidateServices = require("./candidate.services");

class CandidateControllers {
	static async signUp(req, res, next) {
		const userData = await validate(CandidateValidators.signUp, req.body);

		const result = await CandidateServices.signUp({ ...userData });

		return success({
			res,
			result,
			status: STATUS.CREATED,
			code: CODE.CREATED,
		});
	}

	static async logIn() {}

	static async verify() {}

	static async logOut() {}
}

module.exports = CandidateControllers;
