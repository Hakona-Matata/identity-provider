/*
	It will return a random number, 
	It's length ranges between [(1 + payload) and (9 + payload)]
*/
const generate_randomNumber = ({ length }) => {
	// Initiate the length of the wanted number
	const payload = "0".repeat(length - 1);

	// Generate random number based on that length
	return Math.floor(Number(`1${payload}`) + Math.random() * Number(`9${payload}`));
};

module.exports = { generate_randomNumber };
