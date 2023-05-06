/**
 * @module SessionRepository
 * @description This module is responsible for handling CRUD operations on the session model.
 */

const SessionModel = require("./session.model");
const { BaseRepository } = require("./../../repository/index");

class SessionRepository extends BaseRepository {
	constructor() {
		super(SessionModel);
	}
}

module.exports = new SessionRepository();
