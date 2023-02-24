const express = require("express");

const access_controllers = require("./../controllers/access.controllers");
const protect = require("./../../middlewares/protect");

//=============================================================================
const router = express.Router();

router.route("/sign-up").post(access_controllers.signUp_POST_controller);
router
	.route("/verify-email/:verificationToken")
	.get(access_controllers.verify_GET_controller);
router.route("/login").post(access_controllers.login_POST_controller);

router
	.route("/logout")
	.post(protect, access_controllers.logout_POST_controller);

module.exports = router;
