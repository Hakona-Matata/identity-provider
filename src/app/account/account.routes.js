const express = require("express");

const AccountControllers = require("./account.controllers");
const auth = require("./../../middlewares/auth.middleware");

const router = express.Router();

router.route("/sign-up").post(AccountControllers.signUp);

router.route("/verify-email/:verificationToken").get(AccountControllers.verify);

router.route("/login").post(AccountControllers.logIn);

router.route("/logout").post(auth, AccountControllers.logOut);

module.exports = router;
