export default {
	dataField: {
		label: 'Data Field',
		description: 'Select the fields (and their weights) to perform search on.',
		types: ['text', 'keyword', 'string'],
		input: 'dropdown',
		multiple: true,
	},
	categoryField: {
		label: 'Category Field',
		description: 'Select data field which has the category values mapped.',
		types: ['keyword', 'integer', 'float', 'double', 'date'],
		input: 'dropdown',
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
		label: 'Highlight Results',
		description: 'Enable highlighting within results.',
		input: 'bool',
		default: false,
	},
	autosuggest: {
		label: 'Auto Suggest',
		description: 'Enable auto suggestions as you type.',
		input: 'bool',
		default: true,
	},
	customSuggestions:{
		label: 'Custom Suggestions',
		description: 'Render Custom Suggestion in the Suggestion box.',
		input :'editor',
		default: '',
		placeholder: 'Enter your Custom Suggestions'
	},
	size: {
		label: 'Size',
		description: 'Total number of suggestions to fetch (applicable if autosuggest is enabled).',
		input: 'number',
		default: 10,
		min: 0,
	},
	fuzziness: {
		label: 'Typo Tolerance',
		description:
			'Set the typo tolerance level of the search query. 0 implies no typos, 1 implies 1 character typo is tolerated and so on.',
		input: 'number',
		default: 0,
		min: 0,
		max: 2,
	},
	queryFormat: {
		label: 'Match All or Any',
		description:
			'When multiple search terms are present, should All be matched or should Any term be matched.',
		input: 'dropdown',
		options: [{ label: 'Or', key: 'or' }, { label: 'And', key: 'and' }],
		default: 'Or',
	},
};
