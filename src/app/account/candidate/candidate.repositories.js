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

	static async updateCandidateToBeVerified(candidateId) {
		return await AccountModel.findOneAndUpdate(
			{ _id: candidateId },
			{
				$set: { isVerified: true, isVerifiedAt: new Date() },
				$unset: { verificationToken: 1 },
			}
		);
	}

	static async updateCandidate({ filter, setPayload, unSetPayload }) {
		return await AccountModel.findOneAndUpdate(
			{ filter },
			{ $set: { ...setPayload }, $unset: { ...unSetPayload } }
		);
	}
}

module.exports = CandidateRepository;
