const { phone } = require("phone");

/*
    It returns:
        isValid: true,
        phoneNumber: '+201212121212',
        countryIso2: 'EG',
        countryIso3: 'EGY',
        countryCode: '+20'

*/

const validate_phone = (givenPhone) => {
	const result = phone(givenPhone);
	const countryName = get_countryName(result.countryIso2);

	return { ...result, countryName };
};

const get_countryName = (regionCode) => {
	const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
	return regionNames.of(regionCode);
};

module.exports = { validate_phone };
