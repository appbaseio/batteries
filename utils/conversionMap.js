export default {
	text: [],
	string: [],
	object: [],

	integer: ['float', 'long', 'text'],
	long: ['integer', 'text'],
	float: ['integer', 'double', 'text'],
	double: ['integer', 'float', 'text'],

	date: ['text'],
	geo_point: ['text'],
	boolean: ['text'],
};
