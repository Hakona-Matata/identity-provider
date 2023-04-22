const mongoose = require("mongoose");

const connectDB = (app) => {
	if (process.env.NODE_ENV === "test") {
		return Promise.resolve();
	}

	return mongoose
		.connect(process.env.MONGO_URI)
		.then(() => {
			// mongoose.set("strictQuery", true);

			const server = app.listen(process.env.PORT, () => {
				console.log(
					`Server is running on ${process.env.BASE_URL}:${process.env.PORT} in "${process.env.NODE_ENV}" environment`
				);
			});

			

			return server;
		})
		.catch((error) => {
			console.log(error.message);
			process.exit(1);
		});
};

module.exports = connectDB;
