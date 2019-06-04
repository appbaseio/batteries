export default {
	SearchSensor: {
		dataField: [
			'original_title',
			'original_title.autosuggest',
			'original_title.keyword',
			'original_title.search',
			'overview',
			'overview.autosuggest',
			'overview.keyword',
			'overview.search',
		],
		fieldWeights: [10, 4, 10, 4, 2, 1, 2, 1],
		fuzziness: 1,
		autosuggest: false,
		filterLabel: 'search',
		placeholder: 'Search for movies',
		debounce: 0,
		queryFormat: 'or',
		showFilter: true,
		strictSelection: false,
		componentType: 'DATASEARCH',
		title: 'search',
		value: 'the',
		URLParams: true,
		react: {
			and: 'SearchSensor__internal',
		},
	},
	'year-list': {
		dataField: 'release_year',
		size: 0,
		sortBy: 'desc',
		queryFormat: 'or',
		selectAllLabel: 'All',
		showCheckbox: true,
		showSearch: true,
		placeholder: 'Search for a Year',
		showFilter: true,
		showCount: false,
		filterLabel: 'Year',
		showMissing: false,
		missingLabel: 'N/A',
		showLoadMore: false,
		loadMoreLabel: 'Load More',
		componentType: 'MULTILIST',
		title: 'Year',
		value: ['2018'],
		URLParams: false,
		_source: {
			includes: ['*'],
			excludes: [],
		},
		from: 0,
		sort: [
			{
				_score: {
					order: 'desc',
				},
			},
		],
		aggs: {
			release_year: {
				terms: {
					field: 'release_year',
					size: 20,
					order: {
						_term: 'desc',
					},
				},
			},
		},
		react: {
			and: ['SearchSensor', 'results', 'price', 'language-list', 'year-list__internal'],
		},
	},
	'language-list': {
		dataField: 'original_language.keyword',
		size: 0,
		sortBy: 'asc',
		queryFormat: 'or',
		selectAllLabel: 'All Languages',
		showCheckbox: true,
		showSearch: true,
		placeholder: 'Search for a language',
		data: [
			{
				label: 'English',
				value: 'English',
			},
			{
				label: 'Chinese',
				value: 'Chinese',
			},
			{
				label: 'Turkish',
				value: 'Turkish',
			},
			{
				label: 'Swedish',
				value: 'Swedish',
			},
			{
				label: 'Russian',
				value: 'Russian',
			},
			{
				label: 'Portuguese',
				value: 'Portuguese',
			},
			{
				label: 'Korean',
				value: 'Korean',
			},
			{
				label: 'Japanese',
				value: 'Japanese',
			},
			{
				label: 'Italian',
				value: 'Italian',
			},
			{
				label: 'Hindi',
				value: 'Hindi',
			},
			{
				label: 'French',
				value: 'French',
			},
			{
				label: 'Finnish',
				value: 'Finnish',
			},
			{
				label: 'Spanish',
				value: 'Spanish',
			},
			{
				label: 'Deutsch',
				value: 'Deutsch',
			},
		],
		showFilter: true,
		filterLabel: 'Language',
		showCount: false,
		componentType: 'MULTIDATALIST',
		title: 'Language',
		value: ['English'],
		URLParams: false,
		_source: {
			includes: ['*'],
			excludes: [],
		},
		from: 0,
		sort: [
			{
				_score: {
					order: 'desc',
				},
			},
		],
		aggs: {
			release_year: {
				terms: {
					field: 'release_year',
					size: 20,
					order: {
						_term: 'desc',
					},
				},
			},
		},
		react: {
			and: ['SearchSensor', 'results', 'price', 'year-list', 'language-list__internal'],
		},
	},
	price: {
		dataField: 'price',
		range: {
			start: 0,
			end: 1500,
		},
		showHistogram: false,
		showSlider: true,
		snap: true,
		stepValue: 1,
		showFilter: true,
		componentType: 'RANGESLIDER',
		title: 'price',
		value: [0, 1500],
		URLParams: false,
		size: 0,
		aggs: {
			release_year: {
				terms: {
					field: 'release_year',
					size: 20,
					order: {
						_term: 'desc',
					},
				},
			},
		},
		react: {
			and: ['SearchSensor', 'language-list', 'year-list', 'price__internal'],
		},
	},
	results: {
		dataField: 'original_title',
		pagination: true,
		size: 4,
		sortOptions: [
			{
				dataField: '_score',
				sortBy: 'desc',
				label: 'Sort by Best Match   ',
			},
			{
				dataField: 'popularity',
				sortBy: 'desc',
				label: 'Sort by Popularity(High to Low)   ',
			},
			{
				dataField: 'price',
				sortBy: 'asc',
				label: 'Sort by Price(Low to High)  ',
			},
			{
				dataField: 'vote_average',
				sortBy: 'desc',
				label: 'Sort by Ratings(High to Low)  ',
			},
			{
				dataField: 'original_title.keyword',
				sortBy: 'asc',
				label: 'Sort by Title(A-Z)  ',
			},
		],
		includeFields: ['*'],
		excludeFields: [],
		componentType: 'REACTIVELIST',
		aggs: {
			release_year: {
				terms: {
					field: 'release_year',
					size: 20,
					order: {
						_term: 'desc',
					},
				},
			},
		},
		_source: {
			includes: ['*'],
			excludes: [],
		},
		from: 0,
		sort: [
			{
				_score: {
					order: 'desc',
				},
			},
		],
		react: {
			and: ['SearchSensor', 'price', 'language-list', 'year-list', 'results__internal'],
		},
	},
};
