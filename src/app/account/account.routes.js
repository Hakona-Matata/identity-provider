const express = require("express");

const { signUp, verify, logIn, logOut } = require("./account.controllers");
const { isAuthenticated, isVerified, isActive, isNotDeleted } = require("./../../middlewares/index");

const router = express.Router();

router.route("/sign-up").post(signUp);

router.route("/verify-email/:verificationToken").get(verify);

router.route("/login").post(logIn);

router.route("/logout").post([isAuthenticated, isVerified, isActive, isNotDeleted], logOut);

module.exports = router;
