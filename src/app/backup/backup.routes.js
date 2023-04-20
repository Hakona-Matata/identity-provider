const express = require("express");

const { initiateEnabling, confirmEnabling, disable, regenerate, verify } = require("./backup.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

router.route("/initiate").post([isAuthenticated, isVerified, isActive], initiateEnabling);

router.route("/confirm").post([isAuthenticated, isVerified, isActive], confirmEnabling);

router.route("/disable").delete([isAuthenticated, isVerified, isActive], disable);

router.route("/regenerate").post([isAuthenticated, isVerified, isActive], regenerate);

router.route("/verify", verify);

module.exports = router;
