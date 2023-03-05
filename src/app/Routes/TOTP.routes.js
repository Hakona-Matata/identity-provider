const express = require("express");

const TOTP_controllers = require("./../controllers/TOTP.controllers");
const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");

const router = express.Router();

router
	.route("/enable")
	.post(protect, isVerified, TOTP_controllers.enableTOTP_POST_controller);

router
	.route("/confirm")
	.post(protect, isVerified, TOTP_controllers.confirmTOTP_POST_controller);

module.exports = router;
