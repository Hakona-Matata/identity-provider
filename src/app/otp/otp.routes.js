const express = require("express");

const { enable, confirm, disable, send, verify } = require("./otp.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

// During setup
router.route("/enable").get([isAuthenticated, isVerified, isActive], enable);

router.route("/confirm").post([isAuthenticated, isVerified, isActive], confirm);

router.route("/disable").delete([isAuthenticated, isVerified, isActive], disable);

// During Login process
router.route("/send").post(send);

router.route("/verify").post(verify);

module.exports = router;
