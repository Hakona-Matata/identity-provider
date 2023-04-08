const express = require("express");

const CandidateControllers = require("./candidate.controllers");

const router = express.Router();

router.route("/sign-up").post(CandidateControllers.signUp);

module.exports = router;
