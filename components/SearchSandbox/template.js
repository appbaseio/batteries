import React from 'react';
import { DataSearch, ReactiveList, MultiList } from '@appbaseio/reactivesearch';
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
					title={item + ": " + JSON.stringify(res[item])}
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

function getApp(config) {
	let listCode = '';
	let searchCode = '';
	let resultCode = '';

	const types = {
		search: DataSearch,
		result: ReactiveList,
	};

	const names = {
		search: 'DataSearch',
		result: 'ReactiveList',
	};

	let resultComponentProps = config.componentProps.result || {};
	resultComponentProps = {
		size: 5,
		pagination: true,
		...resultComponentProps,
		react: {
			and: Object.keys(config.componentProps).filter(item => item !== 'result'),
		},
	};

	Object.keys(config.componentProps)
		.forEach((item) => {
			const Component = types[item] || MultiList;
			const name = names[item] || 'MultiList';
			let otherProps = {};

			if (item === 'result') {
				otherProps = resultComponentProps;
			} else if (item === 'search') {
				otherProps = {
					fieldWeights: generateFieldWeights(
						config.componentProps.search.dataField,
						config.componentProps.search.fieldWeights,
						config.mappings,
					),
				};
			}

			let currentCode = reactElementToJSXString(<Component
				componentId={item}
				{...config.componentProps[item]}
				{...otherProps}
				dataField={generateDataField(
					name,
					config.componentProps[item].dataField,
					config.mappings,
				)}
			/>, { showFunctions: true });

			currentCode = currentCode.split('\n').slice(1).join('\n\t\t\t\t\t');

			if (item === 'search') {
				searchCode = `${searchCode}
					 <DataSearch
						style={{ marginBottom: 20 }}
					${currentCode}
`;
			} else if (item === 'result') {
				resultCode = `${resultCode}
					 <ReactiveList
					 	style={{ marginTop: 20 }}
						onData={onData}
					${currentCode}
`;
			} else {
				listCode = `${listCode}
					 <MultiList
						style={{ marginBottom: 20 }}
					${currentCode}
`;
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
				${listCode}
				</Card>
			</Col>
			<Col span={12}>
				${searchCode}

				<SelectedFilters />

				${resultCode}
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
	return (`${HEADER}${getApp(config)}`);
}

function getTemplateStyles() {
	return `
.list-item {
	padding: 20px 0;
	font-size: 16px;
	line-height: 30px;
	border-bottom: 1px solid #eee;
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
