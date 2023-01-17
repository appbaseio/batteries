/* eslint-disable no-template-curly-in-string */
const apisMapper = {
	solr: {
		search: {
			url: '/_solr/_reactivesearch',
			method: 'POST',
		},
		index: {
			url: '/_solr/solr/admin/collections?action=LIST',
			method: 'GET',
		},
		schema: {
			url: '/_solr/api/suggestions/collections/${index}/schema',
			method: 'GET',
		},
	},
	fusion: {
		search: {
			url: '/_fusion/_reactivesearch',
			method: 'POST',
		},
		app: {
			url: '/_fusion/api/apps',
			method: 'GET',
			qs: [
				{
					key: 'username',
					value: 'appbase',
				},
				{
					key: 'password',
					value: 'Appbase123',
				},
				{
					key: 'fusion_url',
					value: 'http://34.122.120.39:6764',
				},
			],
		},
		index: {
			url: '/_fusion/api/apps/${app}/query-profiles',
			qs: [
				{
					key: 'username',
					value: 'appbase',
				},
				{
					key: 'password',
					value: 'Appbase123',
				},
				{
					key: 'fusion_url',
					value: 'http://34.122.120.39:6764',
				},
			],
			method: 'GET',
		},
		schema: {
			url: '/_fusion/api/suggestions/collections/${index}/schema/fields',
			method: 'GET',
			qs: [
				{
					key: 'q',
					value: '${query}',
				},
				{
					key: 'username',
					value: 'appbase',
				},
				{
					key: 'password',
					value: 'Appbase123',
				},
				{
					key: 'fusion_url',
					value: 'http://34.122.120.39:6764',
				},
			],
		},
	},
	elasticsearch: {
		index: {
			url: '/_aliasedindices',
			method: 'GET',
		},
		search: {
			url: '/${index}/_reactivesearch',
			method: 'POST',
		},
		schema: {
			url: '/${index}/_mapping',
			method: 'GET',
		},
	},
	zinc: {
		index: {
			url: '/_indices',
			method: 'GET',
		},
		schema: {
			url: '/${index}/_schema',
			method: 'GET',
		},
		search: {
			url: '/_zinc/${index}/_reactivesearch',
			method: 'POST',
		},
	},
	system: {
		index: {
			url: '/_aliasedindices',
			method: 'GET',
		},
		search: {
			url: '/${index}/_reactivesearch',
			method: 'POST',
		},
		schema: {
			url: '/${index}/_mapping',
			method: 'GET',
		},
	},
};

export default apisMapper;
