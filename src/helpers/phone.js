const { phone } = require("phone");

class PhoneHelper {
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

	static validatePhone(givenPhone = null) {
		const { isValid, phoneNumber, countryCode: code, countryIso2: iso2 } = phone(givenPhone);

		if (!isValid) {
			return { isValid: false };
		}

		const name = PhoneHelper.#getCountryName(iso2);

		return {
			isValid: true,
			phone: phoneNumber,
			country: {
				name,
				code,
				iso2,
			},
		};
	}

	static #getCountryName(regionCode) {
		const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
		return regionNames.of(regionCode);
	}
}

module.exports = PhoneHelper;
