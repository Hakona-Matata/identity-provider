const express = require("express");

const SMS_controllers = require("./../../app/controllers/SMS.controllers");
const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");

const router = express.Router();

router
	.route("/enable")
	.post(protect, isVerified, SMS_controllers.enableSMS_POST_controller);

router
	.route("/confirm")
	.post(protect, isVerified, SMS_controllers.confirmSMS_POST_controller);

router
	.route("/disable")
	.delete(protect, isVerified, SMS_controllers.disableSMS_delete_controller);

router.route("/send").post(SMS_controllers.sendSMS_POST_controller);

router.route("/verify").post(SMS_controllers.verifySMS_post_controller);

module.exports = router;
