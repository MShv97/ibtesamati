const { Exception } = require('utils');

module.exports = {
	priceFilter(criteria) {
		if (typeof criteria.price !== 'object') return;
		if (criteria.price) {
			Object.keys(criteria.price).forEach((key) => {
				criteria['$and'].push({
					$expr: {
						[key]: [{ $subtract: ['$price', { $multiply: ['$price', '$discount'] }] }, criteria.price[key]],
					},
				});
			});
		}
		delete criteria.price;
	},
};
