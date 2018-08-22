export default {
	dataField: {
		label: 'Data Field',
		description: 'Select the fields you want to perform search on',
		types: ['text', 'keyword', 'string'],
		input: 'dropdown',
		multiple: true,
	},
	autosuggest: {
		label: 'Auto Suggest',
		description: 'This will enable search component to fetch suggestions as you type',
		input: 'bool',
		default: true,
	},
	title: {
		label: 'Title',
		description: '',
		input: 'string',
	},
	placeholder: {
		label: 'Placeholder',
		description: '',
		input: 'string',
	},
	highlight: {
		label: 'Highlight results',
		description: 'This will enable search highlighting',
		input: 'bool',
		default: false,
	},
	size: {
		label: 'Size',
		description: 'Total number of suggestions to fetch - if autosuggest is set to true',
		input: 'number',
		default: 10,
	},
	fuzziness: {
		label: 'Fuzziness',
		description: '',
		input: 'number',
		default: 0,
	},
	debounce: {
		label: 'Debounce',
		description: 'Sets the milliseconds to wait before executing the query.',
		input: 'number',
		default: 0,
	},
	showFilter: {
		label: 'Show Filter',
		description: 'Show as filter when a value is selected in a global selected filters view.',
		input: 'bool',
		default: true,
	},
	filterLabel: {
		label: 'Filter label',
		description: 'An optional label to display for the component in the global selected filters view. Applicable when show filter is true.',
		input: 'string',
		default: '',
	},
	queryFormat: {
		label: 'Query Format',
		description: 'Sets the query format, can be or or and. Defaults to or.',
		input: 'dropdown',
		options: [{ label: 'Or', key: 'or' }, { label: 'And', key: 'and' }],
		default: 'or',
	},
};
