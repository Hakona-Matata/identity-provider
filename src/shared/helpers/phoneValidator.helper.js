const { phone } = require("phone");

/**
 * A class containing phone-related helper functions.
 *
 * @class
 */
class PhoneHelper {
	/**
	 * Validates the given phone number and returns information about it.
	 * @param {string|null} givenPhone - The phone number to validate. If `null`, validation fails.
	 * @returns {{
	 *  isValid: boolean,
	 *  phone: string,
	 *  country: {
	 *      name: string,
	 *      iso2: string,
	 *      code: string
	 *  }
	 * }} - An object containing information about the validated phone number.
	 * If `isValid` is `false`, `phone` and `country` will be empty.
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

	/**
	 * A private helper function that returns the name of the country corresponding to the given ISO 3166-1 alpha-2 code.
	 *
	 * @private
	 * @param {string} regionCode - The ISO 3166-1 alpha-2 code of the country.
	 * @returns {string} - The name of the country corresponding to the given ISO 3166-1 alpha-2 code.
	 */
	static #getCountryName(regionCode) {
		const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
		return regionNames.of(regionCode);
	}
}

module.exports = PhoneHelper;
