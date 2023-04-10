const express = require("express");

const SessionControllers = require("./session.controllers");

const isAuthenticated = require("../../middlewares/isAuthenticated.middleware");
const isVerified = require("./../../middlewares/isVerified.middleware");

const router = express.Router();

router
	.route("/")
	.get(isAuthenticated, isVerified, SessionControllers.getAll)
	.post(isAuthenticated, isVerified, SessionControllers.cancel);

router.route("/renew").post(SessionControllers.renew);

module.exports = router;
