const express = require("express");

const { intiateEnabling, confirmEnabling, disable, regenerate } = require("./backup.controllers");

const router = express.Router();

router.route("/initiate").post(intiateEnabling);

router.route("/confirm").post(confirmEnabling);

router.route("/disable").delete(disable);

router.route("/regenerate").post(regenerate);

module.exports = router;
