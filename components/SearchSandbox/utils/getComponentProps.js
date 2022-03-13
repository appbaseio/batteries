import React from 'react';
import createDOMPurify from 'dompurify';
import { listLabel } from '../styles';
import RenderResults from '../components/RenderResults';
import { generateFieldWeights, generateDataField } from './dataField';

const DOMPurify = createDOMPurify(window);

function getDataSearchProps({ componentProps, mappings, version }) {
	componentProps.fuzziness = componentProps.fuzziness ? Number(componentProps.fuzziness) : 0;
	let fields = generateDataField('DataSearch', componentProps.dataField, mappings);
	const weights = generateFieldWeights(
		componentProps.dataField,
		componentProps.fieldWeights,
		mappings,
	);

	if (+version >= 7) {
		/*
			Query used by DataSearch component doesn’t work for a field
			with the keyword mapping from ES 7.
		 */
		const keywordIndex = fields.findIndex(field => field.includes('.keyword'));
		weights.splice(keywordIndex, 1);
		fields = fields.filter(field => !field.includes('.keyword'));
	}

	return {
		fuzziness: 0,
		...componentProps,
		dataField: [...new Set(fields)],
		fieldWeights: weights,
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
	component,
	componentProps,
	mappings,
	setRenderKey,
	version,
}) {
	switch (component) {
		case 'DataSearch':
			return getDataSearchProps({ componentProps, mappings, version });
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
						<div
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={{
								__html: DOMPurify.sanitize(label),
							}}
						/>
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
