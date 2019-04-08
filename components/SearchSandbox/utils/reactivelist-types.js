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
	sortBy: {
		label: 'Sort Order',
		description: 'Sort the results by one of Best Match, Ascending or Descending order.',
		input: 'dropdown',
		options: [
			{ label: 'Best Match', key: 'best' },
			{ label: 'Ascending', key: 'asc' },
			{ label: 'Descending', key: 'desc' },
		],
		default: 'Best Match',
	},
	size: {
		label: 'Size',
		description: 'Total number of results to fetch (maximum value is 1000).',
		input: 'number',
		default: 10,
		min: 1,
	},
	pagination: {
		label: 'Show Pages',
		description:
			'Enable pagination within the results. If set to false, it creates an infinite scroll view.',
		input: 'bool',
		default: true,
	},
	stream: {
		label: 'Stream',
		description: 'Enable streaming of live result updates.',
		input: 'bool',
		default: false,
	},
};
