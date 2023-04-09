const express = require("express");

const CandidateControllers = require("./candidate.controllers");

const router = express.Router();

router.route("/sign-up").post(CandidateControllers.signUp);

router.route("/verify-email/:verificationToken").get(CandidateControllers.verify);

router.route("/login").post(CandidateControllers.logIn);

module.exports = router;
