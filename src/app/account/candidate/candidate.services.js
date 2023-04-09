const CandidateRepository = require("./candidate.repositories");
const {
	SUCCESS_MESSAGES,
	FAILIURE_MESSAGES,
} = require("../../../constants/messages");
const ROLES = require("./../../../constants/roles");

const BadRequestError = require("./../../../Errors/common/badRequest.error");

const TokenHelper = require("./../../../helpers/token");
const HashHelper = require("./../../../helpers/hash");
const sendEmail = require("./../../../helpers/email");

class CandidateServices {
	static async signUp(payload) {
		const newCandidate = await CandidateRepository.createCandidate({
			...payload,
			password: await HashHelper.generate({ plainText: payload.password }),
		});

		const verificationToken = await TokenHelper.generateVerificationToken({
			_id: newCandidate.id,
			role: ROLES.candidate,
		});
		const verificationLink = `${process.env.BASE_URL}:${process.env.PORT}/auth/verify-email/${verificationToken}`;

		// TODO: Send email
		if (process.env.NODE_ENV !== "test") {
			console.log({ verificationLink });
			// await sendEmail({
			// 	from: "Hakona Matata company",
			// 	to: candidate.email,
			// 	subject: "Email Verification",
			// 	text: `Hello, ${candidate.email}\nPlease click the link to verify your email (It's only valid for ${process.env.VERIFICATION_TOKEN_EXPIRES_IN})\n${verificationLink}\nthanks.`,
			// });
		}

		await CandidateRepository.updateCandidate({
			filter: { _id: newCandidate._id },
			payload: { verificationToken },
		});

		return SUCCESS_MESSAGES.signUp;
	}

	static async verify(verificationToken) {
		const token = await TokenHelper.verifyVerificationToken(verificationToken);

		const candidate = await CandidateRepository.findCandidateById(token._id);

		if (candidate && candidate.isVerified) {
			throw new BadRequestError(MESSAGES.failure.ACCOUNT_ALREADY_VERIFIED);
		}

		await CandidateRepository.updateCandidateToBeVerified(token._id);

		return SUCCESS_MESSAGES.VERIFY;
	}

	static async logIn() {}

	static async logOut() {}
}

module.exports = CandidateServices;
