const express = require("express");

const { intiateEnabling, confirmEnabling, disable } = require("./totp.controllers");

const router = express.Router();

router.route("/enable").post(intiateEnabling);

router.route("/confirm").post(confirmEnabling);

router.route("/disable").delete(disable);

module.exports = router;
