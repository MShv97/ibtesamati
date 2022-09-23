const setGeo = require('./setGeo');

module.exports = (address) => {
	if (!address) return;
	const result = {};

	if (address.country) result['country'] = address.country;
	if (address.province) result['province'] = address.province;
	if (address.city) result['city'] = address.city;
	if (address.postalCode) result['province'] = address.province;
	if (address.location) result['location'] = address.location;
	result.geo = setGeo(address, 'Point');

	return result;
};
