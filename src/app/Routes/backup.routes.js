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

module.exports = router;
