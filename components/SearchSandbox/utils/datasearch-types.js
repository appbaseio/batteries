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
};
