import React from 'react';
import reactElementToJSXString from 'react-element-to-jsx-string';

import { generateDataField, generateFieldWeights } from './utils/dataField';
import { renderHeader, renderAsTree, renderWithOnData } from './render';

const getHeader = (config) => {
	const isMetaDataPresent =		config.componentProps.result.metaFields
		&& config.componentProps.result.metaFields.title
		&& config.componentProps.result.metaFields.description;
	const showTree = !isMetaDataPresent;
	return `${renderHeader()}
${showTree ? renderAsTree() : renderWithOnData(config)}`;
};

export function getComponentCode(config) {
	let allProps = config.componentProps || {};
	const { meta, metaFields, ...otherProps } = allProps;
	let componentStyle = {};
	switch (config.component) {
		case 'ReactiveList': {
			if (allProps.sortBy === 'best') {
				delete otherProps.sortBy;
			}
			allProps = {
				componentId: config.componentId,
				size: 5,
				pagination: true,
				...otherProps,
				react: {
					and: Object.values(config.componentProps.react.and),
				},
				dataField: generateDataField(
					'ReactiveList',
					config.componentProps.dataField,
					config.mappings,
				),
				...config.customProps,
				renderItem: '{renderItem}',
			};
			componentStyle = { marginTop: 20 };
			break;
		}
		case 'DataSearch': {
			const { categoryField, ...restProps } = config.componentProps;
			allProps = {
				componentId: config.componentId,
				...restProps,
				fieldWeights: generateFieldWeights(
					config.componentProps.dataField,
					config.componentProps.fieldWeights,
					config.mappings,
				),
				dataField: generateDataField(
					'DataSearch',
					config.componentProps.dataField,
					config.mappings,
				),
				highlightField: config.componentProps.dataField,
			};
			componentStyle = { marginBottom: 20 };
			break;
		}
		case 'CategorySearch': {
			allProps = {
				componentId: config.componentId,
				...config.componentProps,
				fieldWeights: generateFieldWeights(
					config.componentProps.dataField,
					config.componentProps.fieldWeights,
					config.mappings,
				),
				dataField: generateDataField(
					'DataSearch',
					config.componentProps.dataField,
					config.mappings,
				),
				categoryField: generateDataField(
					'MultiList',
					config.componentProps.categoryField,
					config.mappings,
				),
				highlightField: config.componentProps.dataField,
				...config.customProps,
			};
			componentStyle = { marginBottom: 20 };
			break;
		}
		case 'MultiList': {
			allProps = {
				componentId: config.componentId,
				...config.componentProps,
				dataField: generateDataField(
					'MultiList',
					config.componentProps.dataField,
					config.mappings,
				),
				...config.customProps,
			};
			componentStyle = { marginBottom: 20 };
			break;
		}
		default:
			return 'Nothing to Display';
	}
	let code = reactElementToJSXString(<div style={componentStyle} {...allProps} />, {
		showFunctions: false,
		useBooleanShorthandSyntax: false,
	});

	code = code.replace('renderItem="{renderItem}"', 'renderItem={renderItem}');
	code = code.replace('div', config.component);

	return code;
}

function sandboxCodeFormat(code) {
	return code.split('\n').join('\n\t\t\t\t');
}

function getApp(config) {
	let listCode = '';
	let searchCode = '';
	let resultCode = '';

	let componentConfig = {};
	let searchComponentProps = config.componentProps.search || {};
	let resultComponentProps = config.componentProps.result || {};

	Object.keys(config.componentProps).forEach((item) => {
		switch (item) {
			case 'search': {
				searchComponentProps = {
					...searchComponentProps,
					highlightField: config.componentProps.search.dataField,
				};
				componentConfig = {
					component: 'DataSearch',
					mappings: config.mappings,
					componentProps: searchComponentProps,
					customProps: config.customProps,
					componentId: item,
				};
				searchCode = getComponentCode(componentConfig);
				break;
			}
			case 'result': {
				resultComponentProps = {
					size: 5,
					pagination: true,
					...resultComponentProps,
					react: {
						and: Object.keys(config.componentProps).filter(
							component => component !== 'result',
						),
					},
				};
				componentConfig = {
					component: 'ReactiveList',
					mappings: config.mappings,
					customProps: config.customProps,
					componentProps: resultComponentProps,
					componentId: 'result',
				};
				resultCode = getComponentCode(componentConfig);
				break;
			}
			default: {
				const listComponentProps = {
					...config.componentProps[item],
				};
				componentConfig = {
					component: 'MultiList',
					mappings: config.mappings,
					customProps: config.customProps,
					componentId: item,
					componentProps: listComponentProps,
				};
				if (listCode) {
					listCode = `${listCode}\n${getComponentCode(componentConfig)}`;
				} else {
					listCode = getComponentCode(componentConfig);
				}
			}
		}
	});

	let attributionContainer = '';

	if (config.attribution) {
		const attributionText = config.attribution.link
			? `<a href="${config.attribution.link}" rel="noopener noreferrer" target="_blank">
					${config.attribution.text}
				</a>`
			: `${config.attribution.text}`;
		attributionContainer = `<Affix
			style={{
				position: "fixed",
				bottom: "20px",
				left: "25px",
				padding: "5px 10px",
				background:'white',
				boxShadow: "0px 0px 2px rgba(0,0,0,0.3)"
			}}
		>
			${attributionText}
		</Affix>`;
	}

	return `
const App = () => (
	<ReactiveBase
		app="${config.appName}"
		credentials="${config.credentials}"
		url="${config.url}"
		analytics
	>
		<Row gutter={16} style={{ padding: 20 }}>
			<Col span={12}>
				<Card>
				${sandboxCodeFormat(listCode)}
				</Card>
			</Col>
			<Col span={12}>
				${sandboxCodeFormat(searchCode)}

				<SelectedFilters />

				${sandboxCodeFormat(resultCode)}
			</Col>
			${attributionContainer}
		</Row>
	</ReactiveBase>
);

ReactDOM.render(
	<App />,
	document.getElementById('root')
);
`;
}

export default function getSearchTemplate(config) {
	return `${getHeader(config)}${getApp(config)}`;
}

function getTemplateStyles() {
	return `
.list-item {
	padding: 20px 0;
	font-size: 16px;
	line-height: 30px;
	border-bottom: 1px solid #eee;
}

.list-item mark {
	background-color: #f5ff00;
}

.list-item li {
	word-wrap: break-word;
	width: 100%;
	overflow: hidden;
}

.list-item > div {
	margin-bottom: 4px;
}

.list-item:last-child {
	border: 0;
}

.react-expand-collapse__content {
	position: relative;
	overflow: hidden;
}

.react-expand-collapse__body {
	display: inline;
}

/* expand-collapse button */
.react-expand-collapse__button {
	color: #22a7f0;
	position: absolute;
	bottom: 0;
	right: 0;
	background-color: #fff;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;
}

.react-expand-collapse__button:before {
	content: '';
	position: absolute;
	top: 0;
	left: -20px;
	width: 20px;
	height: 100%;
	background: linear-gradient(to right, transparent 0, #fff 100%);
}

/* expanded state */
.react-expand-collapse--expanded .react-expand-collapse__button {
	padding-left: 5px;
	position: relative;
	bottom: auto;
	right: auto;
}

.react-expand-collapse--expanded .react-expand-collapse__button:before {
	content: none;
}
`;
}

export { getTemplateStyles };
