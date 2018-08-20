import React from 'react';
import reactElementToJSXString from 'react-element-to-jsx-string';

import { generateDataField, generateFieldWeights } from './utils/dataField';

const HEADER = `
import React from 'react';
import ReactDOM from 'react-dom';

import {
	ReactiveBase,
	DataSearch,
	MultiList,
	SelectedFilters,
	ReactiveList
} from '@appbaseio/reactivesearch';
import {
	Row,
	Col,
	Card,
	Switch,
	Tree,
	Popover,
} from 'antd';
import ExpandCollapse from 'react-expand-collapse';

import 'antd/dist/antd.css';
import './styles.css';

const { TreeNode } = Tree;

function onData(res) {
	return (
		<div className="list-item" key={res._id}>
			<ExpandCollapse
				previewHeight="390px"
				expandText="Show more"
			>
				{
					<Tree showLine>
						{renderAsTree(res)}
					</Tree>
				}
			</ExpandCollapse>
		</div>
	);
};

const renderAsTree = (res, key = '0') => {
	if (!res) return null;
	const iterable = Array.isArray(res) ? res : Object.keys(res);
	return iterable.map((item, index) => {
		const type = typeof res[item];
		if (type === 'string' || type === 'number') {
			return (
				<TreeNode
					title={
						<div>
							<span>{item}:</span>&nbsp;
							<span dangerouslySetInnerHTML={{ __html: res[item] }} />
						</div>
					}
					key={key + "-" + (index + 1)}
				/>
			);
		}
		const hasObject = (res[item] === undefined && typeof item !== 'string');
		const node = hasObject ? item : res[item];
		return (
			<TreeNode
				title={typeof item !== 'string' ? 'Object' : '' + (node || Array.isArray(res) ? item : item + ': null')}
				key={key + "-" + (index + 1)}
			>
				{renderAsTree(node, key + "-" + (index + 1))}
			</TreeNode>
		);
	});
};
`;

export function getComponentCode(config) {
	let allProps = config.componentProps || {};
	let componentStyle = {};
	switch (config.component) {
		case 'ReactiveList': {
			allProps = {
				size: 5,
				pagination: true,
				...config.componentProps,
				react: {
					and: Object.values(config.componentProps.react.and),
				},
				onData: '{onData}',
			};
			componentStyle = { marginTop: 20 };
			break;
		}
		case 'DataSearch': {
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
				highlightField: config.componentProps.dataField,
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
			};
			componentStyle = { marginBottom: 20 };
			break;
		}
		default:
			return 'Nothing to Display';
	}
	let code = reactElementToJSXString(
			<div
				style={componentStyle}
				{...allProps}
			/>,
		{ showFunctions: false },
	);

	code = code.replace('onData="{onData}"', 'onData = {onData}');
	code = code.replace('div', config.component);

	return code;
}

function sandboxCodeFormat(code) {
	return code
	.split('\n')
	.join('\n\t\t\t\t');
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
					componentId: item,
				};
				searchCode = getComponentCode(componentConfig, true);
				break;
			}
			case 'result': {
				resultComponentProps = config.componentProps.result || {};
				resultComponentProps = {
					size: 5,
					pagination: true,
					...resultComponentProps,
					react: {
						and: Object.keys(config.componentProps).filter(component => component !== 'result'),
					},
				};
				componentConfig = {
					component: 'ReactiveList',
					mappings: config.mappings,
					componentProps: resultComponentProps,
				};
				resultCode = getComponentCode(componentConfig, true);
				break;
			}
			default: {
				const listComponentProps = {
					dataField:	config.componentProps[item].dataField,
				};
				componentConfig = {
					component: 'MultiList',
					mappings: config.mappings,
					componentId: item,
					componentProps: listComponentProps,
				};
				if (listCode) {
					listCode = `${listCode}\n${getComponentCode(componentConfig, true)}`;
				} else {
					listCode = getComponentCode(componentConfig, true);
				}
			}
		}
	});

	return `
const App = () => (
	<ReactiveBase
		app="${config.appName}"
		credentials="${config.credentials}"
		url="${config.url}"
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
	return `${HEADER}${getApp(config)}`;
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
