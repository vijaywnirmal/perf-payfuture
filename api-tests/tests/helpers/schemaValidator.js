const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function validateSchema(schema, data) {
	const validate = ajv.compile(schema);
	const valid = validate(data);
	if (!valid) {
		const errorText = ajv.errorsText(validate.errors, { separator: '\n' });
		throw new Error(`Schema validation failed:\n${errorText}`);
	}
	return true;
}

module.exports = { validateSchema };


