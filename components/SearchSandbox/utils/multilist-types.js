export default {
	dataField: {
		label: 'Data Field',
		description: 'Select the field for which you want to generate this filter for.',
		types: ['keyword', 'integer', 'float', 'double', 'date'],
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
		description: 'Total number of list items to fetch.',
		input: 'number',
		default: 100,
		min: 0,
	},
	sortBy: {
		label: 'Sort By',
		description: 'Sort the results by either Count, Ascending or Descending order.',
		input: 'dropdown',
		options: [
			{ label: 'Count', key: 'count' },
			{ label: 'Ascending', key: 'asc' },
			{ label: 'Descending', key: 'desc' },
		],
		default: 'Count',
	},
	showSearch: {
		label: 'Show Search',
		description: 'Show a search bar to filter list items.',
		input: 'bool',
		default: true,
	},
	showCount: {
		label: 'Show Count',
		description: 'Show a frequency count next to each list item.',
		input: 'bool',
		default: true,
	},
	showCheckbox: {
		label: 'Show Checkbox',
		description: 'Show a checkbox icon next to each list item.',
		input: 'bool',
		default: true,
	},
	queryFormat: {
		label: 'Match All or Any',
		description:
			'When multiple values are selected, enable either match All values or match Any values.',
		input: 'dropdown',
		options: [{ label: 'Any', key: 'or' }, { label: 'All', key: 'and' }],
		default: 'or',
	},
};
