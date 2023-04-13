const express = require("express");

const SessionControllers = require("./session.controllers");

const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");
const isAccountVerifiedActiveNotDeleted = require("../../middlewares/isVerified.middleware");

const router = express.Router();

router
	.route("/")
	.get(isAuthenticated, isAccountVerifiedActiveNotDeleted, SessionControllers.findAll)
	.post(isAuthenticated, isAccountVerifiedActiveNotDeleted, SessionControllers.cancel);

router.route("/renew").post(SessionControllers.renew);

module.exports = router;
