const mongoose = require("mongoose");

const connect_DB = (app) => {
	app.listen(process.env.PORT, () => {
		mongoose.set("strictQuery", true);

		mongoose
			.connect(process.env.MONGO_URL, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			})
			.then(() => {
				console.log(
					`server is running on ${process.env.BASE_URL}:${process.env.PORT} in "${process.env.NODE_ENV}" environment`
				);
			})
			.catch((error) => {
				console.log(error.message);
			});
	});
};

module.exports = connect_DB;
