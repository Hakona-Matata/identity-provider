const express = require("express");

const {
	deactivate,
	initiateActivation,
	confirmActivation,
	terminate,
	cancelTermination,
} = require("./account.controllers");
const { isAuthenticated, isVerified, isActive } = require("./../../middlewares/index");

const router = express.Router();

router.route("/deactivate").put([isAuthenticated, isVerified], deactivate);

router.route("/activate").put(initiateActivation);

router.route("/activate/:activationToken").get(confirmActivation);

router.route("/delete").delete([isAuthenticated, isVerified, isActive], terminate);

router.route("/cancel-delete").put([isAuthenticated, isVerified, isActive], cancelTermination);

module.exports = router;
