const analyzerSettings = {
	analysis: {
		analyzer: {
			autosuggest_analyzer: {
				filter: ['lowercase', 'asciifolding', 'autosuggest_filter'],
				tokenizer: 'standard',
				type: 'custom',
			},
			ngram_analyzer: {
				filter: ['lowercase', 'asciifolding', 'ngram_filter'],
				tokenizer: 'standard',
				type: 'custom',
			},
			english_analyzer: {
				filter: ['lowercase', 'asciifolding', 'porter_stem'],
				tokenizer: 'standard',
				type: 'custom',
			},
		},
		filter: {
			autosuggest_filter: {
				max_gram: '20',
				min_gram: '1',
				token_chars: ['letter', 'digit', 'punctuation', 'symbol'],
				type: 'edge_ngram',
			},
			ngram_filter: {
				max_gram: '3',
				min_gram: '2',
				token_chars: ['letter', 'digit', 'punctuation', 'symbol'],
				type: 'ngram',
			},
		},
	},
};

export const synonymsSettings = synonyms => ({
	analysis: {
		filter: {
			...analyzerSettings.analysis.filter,
			synonyms_filter: {
				type: 'synonym',
				synonyms,
			},
		},
		analyzer: {
			...analyzerSettings.analysis.analyzer,
			english_synonyms_analyzer: {
				filter: ['lowercase', 'synonyms_filter', 'asciifolding', 'porter_stem'],
				tokenizer: 'standard',
				type: 'custom',
			},
			english_analyzer: {
				filter: ['lowercase', 'asciifolding', 'porter_stem'],
				tokenizer: 'standard',
				type: 'custom',
			},
		},
	},
});

export default analyzerSettings;
