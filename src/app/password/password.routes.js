const express = require("express");

const { change, forget, reset } = require("./password.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

router.route("/change").put([isAuthenticated, isVerified, isActive], change);

router.route("/forget").post(forget);

router.route("/reset").put(reset);

module.exports = router;
