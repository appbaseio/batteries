import dataSearchTypes from './datasearch-types';
import multiListTypes from './multilist-types';
import reactiveListTypes from './reactivelist-types';

const propsMap = {
	DataSearch: dataSearchTypes,
	MultiList: multiListTypes,
	ReactiveList: reactiveListTypes,
};

const getSubFields = (mappings, field, types) =>
	(mappings[field] && mappings[field].fields && mappings[field].fields.length
			? [
				...mappings[field].fields
				.filter(item => types.includes(mappings[field].originalFields[item].type))
				.map(item => `${field}.${item}`),
			]
		: [field]);

const getKeywordField = fields => Object.keys(fields).find((item) => {
	if (
		fields[item].type === 'keyword'
		|| (fields[item].index === 'not_analyzed' && fields[item].type === 'string')
	) {
		return true;
	}
	return false;
});

// generates the dataField prop for reactivesearch component
// based on the selected-field(s)
const generateDataField = (component, selectedFields, mappings) => {
	// no need to get subfields if it is a result component
	if (component === 'ReactiveList') {
		let dataField = '';
		if (mappings[selectedFields].fields.length > 0) {
			const subField = getKeywordField(mappings[selectedFields].originalFields);
			dataField = `${selectedFields}${subField ? `.${subField}` : ''}`;
			return dataField;
		}
		return selectedFields;
	}

	const { types, multiple } = propsMap[component].dataField;
	if (multiple) {
		let resultFields = [];
		selectedFields.forEach((item) => {
			resultFields = [item, ...resultFields, ...getSubFields(mappings, item, types)];
		});
		return resultFields;
	}

	const validFields = getSubFields(mappings, selectedFields, types);
	return validFields ? validFields[0] : null;
};

const getSubFieldWeights = (mappings, field, defaultWeight = 1) =>
	(mappings[field] && mappings[field].fields && mappings[field].fields.length
		? [
			...mappings[field].fields.map((item) => {
				let weight = 1;
				if (item === 'keyword') weight = defaultWeight;
				return parseInt(weight, 10);
			}),
		]
		: []);

const generateFieldWeights = (selectedFields, weights, mappings) => {
	let resultWeights = [];
	selectedFields.forEach((item, index) => {
		resultWeights = [
			...resultWeights,
			parseInt(weights[index], 10),
			...getSubFieldWeights(mappings, item, weights[index]),
		];
	});

	return resultWeights;
};

export { generateDataField, generateFieldWeights };
