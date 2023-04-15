const express = require("express");

const {
	signUp,
	confirmVerification,
	logIn,
	logOut,
	deactivate,
	activate,
	confirmActivation,
} = require("./account.controllers");
const { isAuthenticated, isVerified, isActive, isNotDeleted } = require("./../../middlewares/index");

const router = express.Router();

router.route("/sign-up").post(signUp);

router.route("/verify-email/:verificationToken").get(confirmVerification);

router.route("/login").post(logIn);

router.route("/logout").post([isAuthenticated, isVerified, isActive, isNotDeleted], logOut);

router.route("/deactivate").put([isAuthenticated, isVerified, isActive, isNotDeleted], deactivate);

router.route("/activate").put(activate);

router.route("/activate/:activationToken").get(confirmActivation);

module.exports = router;
