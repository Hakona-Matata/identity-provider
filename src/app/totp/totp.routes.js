const express = require("express");

const { intiateEnabling, confirmEnabling, disable, verify } = require("./totp.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

// During setup
router.route("/enable").post([isAuthenticated, isVerified, isActive], intiateEnabling);

router.route("/confirm").post([isAuthenticated, isVerified, isActive], confirmEnabling);

router.route("/disable").delete([isAuthenticated, isVerified, isActive], disable);

// During Login process
router.route("/verify").post(verify);

module.exports = router;
