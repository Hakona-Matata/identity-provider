const express = require("express");

const access_controllers = require("./../controllers/access.controllers");

//=============================================================================
const router = express.Router();

router.route("/sign-up").post(access_controllers.signUp_POST_controller);
router
	.route("/verify-email/:verificationToken")
	.get(access_controllers.verify_GET_Controller);

module.exports = router;
