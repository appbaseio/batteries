export default {
	dataField: {
		label: 'Data Field',
		description: 'Select the field you want to generate filter for',
		types: ['keyword', 'integer'],
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
	sortBy: {
		label: 'Sort By',
		description: 'Sort the results by either Ascending or Descending order.',
		input: 'dropdown',
		options: [{ label: 'Ascending', key: 'asc' }, { label: 'Descending', key: 'desc' }],
		default: 'asc',
	},
	queryFormat: {
		label: 'Query Format',
		description: 'Sets the query format, can be or or and. Defaults to or.',
		input: 'dropdown',
		options: [{ label: 'Or', key: 'or' }, { label: 'And', key: 'and' }],
		default: 'or',
	},
	showSearch: {
		label: 'Show search',
		description: 'This will render the search component within MultiList',
		input: 'bool',
		default: true,
	},
	showCount: {
		label: 'Show Count',
		description: 'This will show a count of the number of occurences besides each list item',
		input: 'bool',
		default: true,
	},
	showFilter: {
		label: 'Show Filter',
		description: 'Show as filter when a value is selected in a global selected filters view.',
		input: 'bool',
		default: true,
	},
	showCheckbox: {
		label: 'Show Checkbox',
		description: 'Show checkbox icon for each list item.',
		input: 'bool',
		default: true,
	},
	URLParams: {
		label: 'URLParams',
		description:
			'Enable creating a URL query string parameter based on the selected value of the list. This is useful for sharing URLs with the component state. ',
		input: 'bool',
		default: false,
	},
};
