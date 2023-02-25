const express = require("express");

const session_controllers = require("./../controllers/session.controllers");

const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");

//=============================================================================
const router = express.Router();

router
	.route("/sessions")
	.get(protect, isVerified, session_controllers.all_sessions_GET_controller)
	.post(
		protect,
		isVerified,
		session_controllers.cancel_session_POST_controller
	);

router.route('/session/renew').post()

module.exports = router;
