export default {
	text: [],
	object: [],

	integer: ['float', 'long', 'text'],
	long: ['integer', 'text'],
	float: ['integer', 'double', 'text'],
	double: ['integer', 'float', 'text'],

	date: ['text'],
	geo_point: ['text'],
	geo_shape: ['text'],
	boolean: ['text'],
};
