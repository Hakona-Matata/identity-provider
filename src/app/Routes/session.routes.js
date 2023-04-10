const express = require("express");

const session_controllers = require("./../controllers/session.controllers");
const protect = require("./../../middlewares/protect");
const isVerified = require("../../middlewares/isVerified.middleware");

const router = express.Router();

router
	.route("/")
	.get(protect, isVerified, session_controllers.all_sessions_GET_controller)
	.post(
		protect,
		isVerified,
		session_controllers.cancel_session_POST_controller
	);

router.route("/renew").post(session_controllers.renew_session_POST_controller);

module.exports = router;
