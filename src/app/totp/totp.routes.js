const express = require("express");

const { initiateEnabling, confirmEnabling, disable } = require("./totp.controllers");

const router = express.Router();

router.route("/enable").post(initiateEnabling);

router.route("/confirm").post(confirmEnabling);

router.route("/disable").delete(disable);

module.exports = router;
