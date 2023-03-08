const express = require("express");

const backup_controllers = require("./../controllers/backup.controllers");

const protect = require("./../../middlewares/protect");
const isVerified = require("./../../middlewares/isVerified");

const router = express.Router();

router
	.route("/generate")
	.post(
		protect,
		isVerified,
		backup_controllers.generateBackupCodes_POST_controller
	);

router
	.route("/confirm")
	.post(
		protect,
		isVerified,
		backup_controllers.confirmBackupCodes_POST_controller
	);

router
	.route("/regenerate")
	.post(
		protect,
		isVerified,
		backup_controllers.regenerateBackupCodes_POST_controller
	);

router
	.route("/disable")
	.delete(
		protect,
		isVerified,
		backup_controllers.disableBackupCodes_delete_controller
	);

router
	.route("/verify")
	.post(backup_controllers.verifyBackupCodes_POST_controller);

module.exports = router;
