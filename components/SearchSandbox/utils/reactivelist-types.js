export default {
	dataField: {
		label: 'Sort Field',
		description: 'Select the field you want to sort results by',
		types: ['text', 'string', 'number', 'geo_point'],
		input: 'dropdown',
		multiple: false,
	},
	size: {
		label: 'Size',
		description: 'Total number of results to fetch',
		input: 'number',
		default: 5,
	},
	sortBy: {
		label: 'Sort By',
		description: 'Sort the results by either Ascending or Descending order.',
		input: 'dropdown',
		options: [{ label: 'Ascending', key: 'asc' }, { label: 'Descending', key: 'desc' }],
		default: 'asc',
	},
	pagination: {
		label: 'Show pagination',
		description: 'This will render the pagination component with the results',
		input: 'bool',
		default: true,
	},
};
