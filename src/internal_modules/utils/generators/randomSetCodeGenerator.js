module.exports = (num, set) => {
	const result = [];
	const chars = set || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < num; i++) result.push(chars.charAt(Math.floor(Math.random() * (chars.length - 1))));
	return result.join('');
};
