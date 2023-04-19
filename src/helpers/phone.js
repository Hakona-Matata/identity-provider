const { phone } = require("phone");

/*
    It returns:
        isValid: true,
        phone: '+201212121212',
        country:{    
			name: 'Egypt,   
            iso2: 'EG',
            code: '+20'
        }
*/

const validate_phone = (givenPhone) => {
	const { isValid, phoneNumber, countryCode: code, countryIso2: iso2 } = phone(givenPhone);
	const name = get_countryName(iso2);

	return {
		isValid,
		phone: phoneNumber,
		country: {
			name,
			code,
			iso2,
		},
	};
};

const get_countryName = (regionCode) => {
	const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
	return regionNames.of(regionCode);
};

module.exports = { validate_phone };
