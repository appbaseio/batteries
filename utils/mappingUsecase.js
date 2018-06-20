export default {
	aggs: {
		fields: {
			keyword: {
				type: 'keyword',
			},
		},
		analyzer: 'standard',
		search_analyzer: 'standard',
	},
	search: {
		fields: {
			search: {
				type: 'text',
				index: 'analyzed',
				analyzer: 'ngram_analyzer',
				search_analyzer: 'simple',
			},
			autosuggest: {
				type: 'text',
				index: 'analyzed',
				analyzer: 'autosuggest_analyzer',
				search_analyzer: 'simple',
			},
		},
		analyzer: 'standard',
		search_analyzer: 'standard',
	},
	searchaggs: {
		fields: {
			keyword: {
				type: 'keyword',
				index: 'not_analyzed',
			},
			search: {
				type: 'text',
				index: 'analyzed',
				analyzer: 'ngram_analyzer',
				search_analyzer: 'simple',
			},
			autosuggest: {
				type: 'text',
				index: 'analyzed',
				analyzer: 'autosuggest_analyzer',
				search_analyzer: 'simple',
			},
		},
		analyzer: 'standard',
		search_analyzer: 'standard',
	},
	none: {},
};
