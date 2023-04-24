const express = require("express");

const { initiateEnabling, confirmEnabling, disable, verify } = require("./totp.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

router.route("/enable").post([isAuthenticated, isVerified, isActive], initiateEnabling);

router.route("/confirm").post([isAuthenticated, isVerified, isActive], confirmEnabling);

router.route("/disable").delete([isAuthenticated, isVerified, isActive], disable);

router.route("/verify").post(verify);

module.exports = router;
