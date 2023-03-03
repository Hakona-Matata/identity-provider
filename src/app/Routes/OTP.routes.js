const express = require("express");

const OTP_controllers = require("./../controllers/otp.controllers");
const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");

const router = express.Router();

// During setup
router
	.route("/enable")
	.get(protect, isVerified, OTP_controllers.enableOTP_GET_controller);

router
	.route("/confirm")
	.post(protect, isVerified, OTP_controllers.confirmOTP_POST_controller);

router
	.route("/disable")
	.delete(protect, isVerified, OTP_controllers.DisableOTP_DELETE_controller);

// During Login process
router.route("/send").post(OTP_controllers.sendOTP_POST_controller);
router.route("/verify").post(OTP_controllers.verifyOTP_POST_controller);

module.exports = router;
