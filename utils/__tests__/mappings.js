import { transformToES5, updateMapping } from '../mappings';
import mappingUsecase from '../mappingUsecase';

const mappingES2 = {
	inventory: {
		mappings: {
			_default_: {
				dynamic_templates: [{
					for_string: {
						mapping: {
							fielddata: {
								format: 'disabled',
							},
						},
						match: '*',
						match_mapping_type: 'string',
					},
				}],
			},
			data: {
				dynamic_templates: [{
					for_string: {
						mapping: {
							fielddata: {
								format: 'disabled',
							},
						},
						match: '*',
						match_mapping_type: 'string',
					},
				}],
				properties: {
					order_no: {
						type: 'integer',
					},
					date: {
						type: 'date',
						format: 'strict_date_optional_time||epoch_millis',
					},
					date_in_human: {
						type: 'date',
						format: 'strict_date_optional_time||epoch_millis',
					},
					title: {
						type: 'string',
					},
				},
			},
			name: {
				type: 'string',
			},
		},
	},
};

const mappingES5 = {
	inventory: {
		mappings: {
			_default_: {
				dynamic_templates: [{
					for_string: {
						mapping: {
							fielddata: {
								format: 'disabled',
							},
						},
						match: '*',
						match_mapping_type: 'string',
					},
				}],
			},
			data: {
				dynamic_templates: [{
					for_string: {
						mapping: {
							fielddata: {
								format: 'disabled',
							},
						},
						match: '*',
						match_mapping_type: 'string',
					},
				}],
				properties: {
					order_no: {
						type: 'integer',
					},
					date: {
						type: 'date',
						format: 'strict_date_optional_time||epoch_millis',
					},
					date_in_human: {
						type: 'date',
						format: 'strict_date_optional_time||epoch_millis',
					},
					title: {
						type: 'text',
					},
				},
			},
			name: {
				type: 'text',
			},
		},
	},
};

test('transforms ES2 to ES5 mapping', () => {
	expect(transformToES5(mappingES2)).toEqual(mappingES5);
});

test('updates mapping of a field correctly', () => {
	const mapping = {
		properties: {
			order_no: {
				type: 'integer',
			},
			title: {
				type: 'text',
			},
			date: {
				type: 'date',
				format: 'strict_date_optional_time||epoch_millis',
			},
		},
	};

	const updatedMapping = {
		properties: {
			order_no: {
				type: 'integer',
			},
			title: {
				type: 'text',
			},
			date: {
				type: 'text',
			},
		},
	};
	expect(updateMapping(mapping, 'date', 'text')).toEqual(updatedMapping);
});

test('updates mapping and usecase of a field correctly', () => {
	const mapping = {
		properties: {
			order_no: {
				type: 'integer',
			},
			title: {
				type: 'text',
			},
			date: {
				type: 'date',
				format: 'strict_date_optional_time||epoch_millis',
			},
		},
	};

	const updatedMapping = {
		properties: {
			order_no: {
				type: 'integer',
			},
			title: {
				type: 'text',
			},
			date: {
				type: 'text',
				...mappingUsecase.searchaggs,
			},
		},
	};
	expect(updateMapping(mapping, 'date', 'text', 'searchaggs')).toEqual(updatedMapping);
});
