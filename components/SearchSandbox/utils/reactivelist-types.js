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
	pages: {
		label: 'Number of Pages',
		description: 'Number of user selectable pages to be displayed when pagination is enabled. ',
		input: 'number',
		default: 5,
	},
	paginationAt: {
		label: 'Pagination position',
		description: 'Determines the position where to show the pagination.',
		input: 'dropdown',
		options: [{ label: 'Top', key: 'top' }, { label: 'Bottom', key: 'bottom' }, { label: 'Both', key: 'both' }],
		default: 'bottom',
	},
	showResultStats: {
		label: 'Show Result Stats',
		description: 'Whether to show result stats in the form of results found and time taken. ',
		input: 'bool',
		default: true,
	},
	stream: {
		label: 'Stream',
		description: 'Whether to stream new result updates in the UI.',
		input: 'bool',
		default: false,
	},
	loader: {
		label: 'Loading Message',
		description: '',
		input: 'string',
		default: '',
	},
};
