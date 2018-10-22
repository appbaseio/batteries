export default {
	dataField: {
		label: 'Sort Field',
		description: 'Select the field you want to sort results by.',
		types: [
			'text',
			'string',
			'long',
			'integer',
			'short',
			'byte',
			'double',
			'float',
			'half_float',
			'scaled_float',
			'date',
			'boolean',
		],
		input: 'dropdown',
		multiple: false,
	},
	size: {
		label: 'Size',
		description: 'Total number of results to fetch (maximum value is 1000).',
		input: 'number',
		default: 10,
	},
	pagination: {
		label: 'Show Pages',
		description:
			'Enable pagination within the results. If set to false, it creates an infinite scroll view.',
		input: 'bool',
		default: false,
	},
	stream: {
		label: 'Stream',
		description: 'Enable streaming of live result updates.',
		input: 'bool',
		default: false,
	},
};
