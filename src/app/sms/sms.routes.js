const express = require("express");

const { enable, confirm, disable } = require("./sms.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

// During Setup
router.route("/enable").post([isAuthenticated, isVerified, isActive], enable);

router.route("/confirm").post([isAuthenticated, isVerified, isActive], confirm);

router.route("/disable").delete([isAuthenticated, isVerified, isActive], disable);

// // During Login process
// router.route("/send").post(SMS_controllers.sendSMS_POST_controller);

// router.route("/verify").post(SMS_controllers.verifySMS_post_controller);

module.exports = router;
