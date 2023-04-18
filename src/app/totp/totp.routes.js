const express = require("express");

const { intiateEnabling, confirmEnabling, disable } = require("./totp.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

// During setup
router.route("/enable").post([isAuthenticated, isVerified, isActive], intiateEnabling);

router.route("/confirm").post([isAuthenticated, isVerified, isActive], confirmEnabling);

router.route("/disable").delete([isAuthenticated, isVerified, isActive], disable);

module.exports = router;
