const express = require("express");

const session_controllers = require("./../controllers/session.controllers");

const router = express.Router();

router
	.route("/")
	.get(session_controllers.all_sessions_GET_controller)
	.post(session_controllers.cancel_session_POST_controller);

router.route("/renew").post(session_controllers.renew_session_POST_controller);

module.exports = router;
