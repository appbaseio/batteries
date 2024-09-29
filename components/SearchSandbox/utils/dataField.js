import dataSearchTypes from './datasearch-types';
import multiListTypes from './multilist-types';
import reactiveListTypes from './reactivelist-types';
import categorySearchTypes from './categorysearch-types';

const propsMap = {
	DataSearch: dataSearchTypes,
	MultiList: multiListTypes,
	ReactiveList: reactiveListTypes,
	CategorySearch: categorySearchTypes,
};

export const getAvailableDataField = ({ id, component, mappings }) => {
	const { types } = propsMap[component].dataField;

	if (id === 'search') {
		return Object.keys(mappings).filter(field =>
			types.includes(mappings[field].type),
		);
	}

	const fields = Object.keys(mappings).filter(field => {
		let fieldsToCheck = [mappings[field]];

		if (mappings[field].originalFields) {
			fieldsToCheck = [
				...fieldsToCheck,
				...Object.values(mappings[field].originalFields),
			];
		}

		return fieldsToCheck.some(item => types.includes(item.type));
	});

	if (id === 'result') {
		return ['_score', ...fields];
	}

	return fields;
};

const getSubFields = (mappings, field, types) =>
	mappings[field] && mappings[field].fields && mappings[field].fields.length
		? [
				...mappings[field].fields
					.filter(item =>
						types.includes(
							mappings[field].originalFields[item].type,
						),
					)
					.map(item => `${field}.${item}`),
		  ]
		: [field];

const getKeywordField = fields =>
	Object.keys(fields).find(item => {
		if (
			fields[item].type === 'keyword' ||
			(fields[item].index === 'not_analyzed' &&
				fields[item].type === 'string')
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
		if (
			mappings[selectedFields] &&
			mappings[selectedFields].fields.length > 0
		) {
			const subField = getKeywordField(
				mappings[selectedFields].originalFields,
			);
			dataField = `${selectedFields}${subField ? `.${subField}` : ''}`;
			return dataField;
		}
		return selectedFields;
	}

	// this works for the case of search component
	const { types, multiple } = propsMap[component].dataField;
	if (multiple) {
		let resultFields = [];
		selectedFields.forEach(item => {
			resultFields = [
				...resultFields,
				item,
				...getSubFields(mappings, item, types),
			];
		});
		return resultFields;
	}

	// this works for the case of list components
	const validFields = getSubFields(mappings, selectedFields, types);
	return validFields ? validFields[0] : null;
};

// defaultWeight is ignored - we return the same weight (1) for every subfield
// eslint-disable-next-line
const getSubFieldWeights = (mappings, field, defaultWeight) =>
	mappings[field] && mappings[field].fields && mappings[field].fields.length
		? [...mappings[field].fields.map(() => 1)]
		: [];

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
