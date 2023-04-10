const express = require("express");

const AccountControllers = require("./account.controllers");
const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");

const router = express.Router();

router.route("/sign-up").post(AccountControllers.signUp);

router.route("/verify-email/:verificationToken").get(AccountControllers.verify);

router.route("/login").post(AccountControllers.logIn);

router.route("/logout").post(isAuthenticated, AccountControllers.logOut);

module.exports = router;
