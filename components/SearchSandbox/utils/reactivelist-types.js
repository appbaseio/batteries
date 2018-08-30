export default {
	dataField: {
		label: 'Sort Field',
		description: 'Select the field you want to sort results by.',
		types: ['text', 'string', 'number', 'geo_point'],
		input: 'dropdown',
		multiple: false,
	},
	sortBy: {
		label: 'Sort Order',
		description: 'Sort the results by one of Best Match, Ascending or Descending order.',
		input: 'dropdown',
		options: [{ label: 'Best Match', key: '_score' }, { label: 'Ascending', key: 'asc' }, { label: 'Descending', key: 'desc' }],
		default: '_score',
	},
	size: {
		label: 'Size',
		description: 'Total number of results to fetch (maximum value is 1000).',
		input: 'number',
		default: 10,
	},
	pagination: {
		label: 'Show Pages',
		description: 'Enable pagination within the results. If set to false, it creates an infinite scroll view.',
		input: 'bool',
		default: true,
	},
	stream: {
		label: 'Stream',
		description: 'Enable streaming of live result updates.',
		input: 'bool',
		default: false,
	},
	includeFields: {
		label: 'Include Fields',
		description: 'Select which fields should be included in the results (aka whitelisting).',
		input: 'multiDropdown',
		options: [],
		default: ['*'],
	},
	excludeFields: {
		label: 'Exclude Fields',
		description: 'Select which fields should be excluded from the results.',
		input: 'multiDropdown',
		options: [],
		default: [],
	},
	showResultStats: {
		label: 'Show Result Stats',
		description: 'Enable displaying result stats (time taken and total results).',
		input: 'bool',
		default: true,
	},
	loader: {
		label: 'Loading Message',
		description: 'Add an optional message to show while results are loading.',
		input: 'string',
		default: '',
	},
};
