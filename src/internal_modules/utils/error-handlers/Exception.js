class Exception {
	constructor() {
		this.codes = new Map();
	}

	add(model, code, errors) {
		if (this[model]) throw `Exception with model name "${model}" is already added.`;
		if (this.codes.get(code)) throw `Exception error code for model "${model}" is used, please pick another.`;
		this.codes.set(code, model);
		this[model] = errors;
	}
}

module.exports = new Exception();
