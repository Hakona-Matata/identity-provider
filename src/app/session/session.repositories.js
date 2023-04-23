const SessionModel = require("./session.model");
const { BaseRepository } = require("./../../repository/index");

class SessionRepository extends BaseRepository {
	constructor() {
		super(SessionModel);
	}
}

module.exports = new SessionRepository();
