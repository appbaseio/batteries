export default ({
	dataField: {
		label: 'Data Field',
		description: 'Select the field you want to generate filter for',
		types: ['keyword'],
		input: 'dropdown',
		multiple: false,
	},
	title: {
		label: 'Title',
		description: '',
		input: 'string',
	},
	size: {
		label: 'Size',
		description: 'Total number of list items to fetch',
		input: 'number',
		default: 100,
	},
	showSearch: {
		label: 'Show search',
		description: 'This will render the search component within MultiList',
		input: 'bool',
		default: true,
	},
});
