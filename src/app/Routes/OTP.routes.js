const express = require("express");

const OTP_controllers = require("./../controllers/otp.controllers");
const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");

const router = express.Router();

router
	.route("/enable")
	.get(protect, isVerified, OTP_controllers.enableOTP_GET_controller);

module.exports = router;
