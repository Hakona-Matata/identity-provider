const nodemailer = require("nodemailer");

//===================================================================

const sendEmail = async ({ from, to, subject, text }) => {
	let testAccount;

	if (process.env.NODE_ENV === "development") {
		testAccount = await nodemailer.createTestAccount();
	}

	const transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		secure: process.env.NODE_ENV === "development" ? false : true,
		auth: {
			user:
				process.env.NODE_ENV === "development"
					? testAccount.user
					: process.env.MAIL_USER,
			pass:
				process.env.NODE_ENV === "development"
					? testAccount.pass
					: process.env.MAIL_PASS,
		},
	});

	const info = await transporter.sendMail({
		from,
		to,
		subject,
		text,
	});

	if (process.env.NODE_ENV === "development") {
		console.log(
			`"${subject}" sent successfully, check it at:\n${nodemailer.getTestMessageUrl(
				info
			)}`
		);
	}
};

module.exports = sendEmail;
