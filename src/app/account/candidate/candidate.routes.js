const express = require("express");

const CandidateControllers = require("./candidate.controllers");
const auth = require("./../../../middlewares/auth.middleware");

const router = express.Router();

router.route("/sign-up").post(CandidateControllers.signUp);

router.route("/verify-email/:verificationToken").get(CandidateControllers.verify);

router.route("/login").post(CandidateControllers.logIn);

router.route("/logout").post(auth, CandidateControllers.logOut);

module.exports = router;
