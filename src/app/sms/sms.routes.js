const express = require("express");

const { enable, confirm, disable, verify } = require("./sms.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

// During Set Up
router.route("/enable").post([isAuthenticated, isVerified, isActive], enable);

router.route("/confirm").post([isAuthenticated, isVerified, isActive], confirm);

router.route("/disable").delete([isAuthenticated, isVerified, isActive], disable);

// During Log In
router.route("/verify").post(verify);

module.exports = router;
