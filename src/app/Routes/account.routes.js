const express = require("express");

const account_controllers = require("./../controllers/account.controllers");

const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");

const router = express.Router();

router
	.route("/deactivate")
	.put(
		protect,
		isVerified,
		account_controllers.deactivateAccount_PUT_controller
	);

router
	.route("/activate")
	.put(account_controllers.activateAccount_PUT_controller);

router
	.route("/activate/:activationToken")
	.get(account_controllers.confirmActivation_GET_controller);

router
	.route("/delete")
	.delete(protect, isVerified, account_controllers.deleteAccount_DELETE_controller);

module.exports = router;
