const express = require("express");

const { findAll, cancel, renew, validate } = require("./session.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

router
	.route("/")
	.get([isAuthenticated, isVerified, isActive], findAll)
	.post([isAuthenticated, isVerified, isActive], cancel);

router.route("/renew").post(renew);

router.route("/validate").post(validate);

module.exports = router;
