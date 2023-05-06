module.exports = {
	db: {
		baseUrl: process.env.MONGO_URI + "_development",
	},
	host: {
		port: process.env.PORT || 3040,
	},
};
