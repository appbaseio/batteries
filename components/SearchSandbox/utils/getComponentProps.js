import React from 'react';

import RenderResults from '../components/RenderResults';
import { generateFieldWeights, generateDataField } from './dataField';

function getDataSearchProps({ componentProps, mappings }) {
	return {
		...componentProps,
		dataField: generateDataField('DataSearch', componentProps.dataField, mappings),
		fieldWeights: generateFieldWeights(
			componentProps.dataField,
			componentProps.fieldWeights,
			mappings,
		),
		highlightField: componentProps.dataField,
	};
}

function getCategorySearchProps({ componentProps, mappings }) {
	return {
		...componentProps,
		dataField: generateDataField('CategorySearch', componentProps.dataField, mappings),
		categoryField: generateDataField('MultiList', componentProps.categoryField, mappings),
		fieldWeights: generateFieldWeights(
			componentProps.dataField,
			componentProps.fieldWeights,
			mappings,
		),
		highlightField: componentProps.dataField,
	};
}

function getReactiveListProps({ componentProps, setRenderKey, mappings }) {
	const { metaFields } = componentProps;
	const isMetaDataPresent = metaFields && metaFields.title && metaFields.description;
	if (componentProps.sortBy === 'best') {
		delete componentProps.sortBy;
	}
	return {
		size: 5,
		pagination: true,
		paginationAt: 'bottom',
		scrollTarget: 'result',
		fuzziness: 0,
		...componentProps,
		dataField: generateDataField('ReactiveList', componentProps.dataField, mappings),
		onData: (res, triggerAnalytics) => (
			<RenderResults
				key={res._id}
				res={res}
				type={isMetaDataPresent ? 'list' : 'tree'}
				metaFields={metaFields}
				setRenderKey={setRenderKey}
				triggerAnalytics={triggerAnalytics}
			/>
		),
	};
}

export default function getComponentProps({
 component, componentProps, mappings, setRenderKey,
}) {
	switch (component) {
		case 'DataSearch':
			return getDataSearchProps({ componentProps, mappings });
		case 'CategorySearch':
			return getCategorySearchProps({ componentProps, mappings });
		case 'ReactiveList':
			return getReactiveListProps({
				componentProps,
				setRenderKey,
				mappings,
			});
		case 'MultiList':
			return {
				...componentProps,
				dataField: generateDataField('MultiList', componentProps.dataField, mappings),
			};
		default:
			return {};
	}
}
