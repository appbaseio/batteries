import React from 'react';
import { listLabel } from '../styles';
import RenderResults from '../components/RenderResults';
import { generateFieldWeights, generateDataField } from './dataField';

function getDataSearchProps({ componentProps, mappings }) {
	componentProps.fuzziness = componentProps.fuzziness ? Number(componentProps.fuzziness) : 0;
	return {
		fuzziness: 0,
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
	componentProps.fuzziness = componentProps.fuzziness ? Number(componentProps.fuzziness) : 0;
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
	componentProps.size = componentProps.size ? Number(componentProps.size) : 10;
	return {
		size: 5,
		pagination: true,
		paginationAt: 'bottom',
		scrollTarget: 'result',
		...componentProps,
		dataField: generateDataField('ReactiveList', componentProps.dataField, mappings),
		renderItem: (res, triggerClickAnalytics) => (
			<RenderResults
				key={res._id}
				res={res}
				type={isMetaDataPresent ? 'list' : 'tree'}
				metaFields={metaFields}
				setRenderKey={setRenderKey}
				triggerClickAnalytics={triggerClickAnalytics}
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
		case 'MultiList': {
			componentProps.size = componentProps.size ? Number(componentProps.size) : 100;
			return {
				...componentProps,
				dataField: generateDataField('MultiList', componentProps.dataField, mappings),
				renderItem: (label, count) => (
					<div className={listLabel}>
						<div dangerouslySetInnerHTML={{ __html: label }} />
						{componentProps.showCount === false ? null : (
							<span style={{ width: 'auto' }}>{count}</span>
						)}
					</div>
				),
			};
		}
		default:
			return {};
	}
}
