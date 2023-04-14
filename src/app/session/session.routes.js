const express = require("express");

const { findAll, cancel, renew } = require("./session.controllers");
const { isAuthenticated, isVerified, isActive, isNotDeleted } = require("./../../middlewares/index");

const router = express.Router();

router
	.route("/")
	.get([isAuthenticated, isVerified, isActive, isNotDeleted], findAll)
	.post([isAuthenticated, isVerified, isActive, isNotDeleted], cancel);

router.route("/renew").post(renew);

module.exports = router;
