const { addAbortSignal } = require("nodemailer/lib/xoauth2");
const ROLES = require("./../../../constants/roles");
const AccountModel = require("./../account.model");

class CandidateRepository {
	static async createCandidate(payload) {
		return await AccountModel.create({
			...payload,
			role: ROLES.candidate,
		});
	}

	static async findCandidateById(candidateId) {
		return await AccountModel.findOne({
			_id: candidateId,
			role: ROLES.candidate,
		}).lean();
	}

	static async findCandidateByEmail(candidateEmail) {
		return await AccountModel.findOne({
			email: candidateEmail,
			role: ROLES.candidate,
		}).lean();
	}

	static async updateCandidateWithVerificationToken(candidateId, verificationToken) {
		return await AccountModel.findOneAndUpdate(
			{ _id: candidateId, role: ROLES.candidate },
			{
				$set: verificationToken,
			}
		);
	}

	static async updateCandidateToBeVerified(candidateId) {
		return await AccountModel.findOneAndUpdate(
			{ _id: candidateId, role: ROLES.candidate },
			{
				$set: { isVerified: true, isVerifiedAt: new Date() },
				$unset: { verificationToken: 1 },
			}
		);
	}
}

module.exports = CandidateRepository;
