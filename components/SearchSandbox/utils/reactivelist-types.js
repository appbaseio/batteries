export default ({
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
	pagination: {
		label: 'Show pagination',
		description: 'This will render the pagination component with the results',
		input: 'bool',
		default: true,
	},
});
