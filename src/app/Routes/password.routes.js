const express = require("express");

const password_controllers = require("./../controllers/password.controllers");
const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");

const router = express.Router();

router
	.route("/change")
	.put(protect, isVerified, password_controllers.changePassword_PUT_controller);

router
	.route("/forget")
	.post(password_controllers.forgetPassword_POST_controller);

router.route("/reset").put(password_controllers.resetPassword_PUT_controller);

module.exports = router;
