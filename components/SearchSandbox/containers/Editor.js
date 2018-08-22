import React, { Component } from 'react';
import {
	Row,
	Col,
	Card,
	Button,
	Modal,
	Form,
	Input,
	Switch,
	Dropdown,
	Icon,
	Menu,
	Tree,
	Popover,
	Tooltip,
} from 'antd';
import { ReactiveBase, SelectedFilters } from '@appbaseio/reactivesearch';
import ExpandCollapse from 'react-expand-collapse';

import multiListTypes from '../utils/multilist-types';
import RSWrapper from '../components/RSWrapper';
import { listItem, formWrapper } from '../styles';

const { TreeNode } = Tree;

export default class Editor extends Component {
	constructor(props) {
		super(props);

		const dataFields = this.getAvailableDataField();
		this.state = {
			showModal: false,
			listComponentProps: {
				dataField: dataFields.length ? dataFields[0] : '',
			},
		};
	}

	getAvailableDataField = () => {
		const { types } = multiListTypes.dataField;
		const fields = Object.keys(this.props.mappings).filter((field) => {
			let fieldsToCheck = [this.props.mappings[field]];

			if (this.props.mappings[field].originalFields) {
				fieldsToCheck = [
					...fieldsToCheck,
					...Object.values(this.props.mappings[field].originalFields),
				];
			}

			return fieldsToCheck.some(item => types.includes(item.type));
		});

		return fields;
	};

	copyJSON = (code) => {
		const el = document.createElement('textarea');
		el.value = JSON.stringify(code);
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
		this.setState(
			{
				copied: true,
			},
			() =>
				setTimeout(
					() =>
						this.setState({
							copied: false,
						}),
					300,
				),
		);
	};

	showModal = () => {
		this.setState({
			showModal: true,
		});
	};

	resetNewComponentData = () => {
		const dataFields = this.getAvailableDataField();
		this.setState({
			listComponentProps: {
				dataField: dataFields.length ? dataFields[0] : '',
			},
		});
	};

	handleOk = () => {
		// only set to store if dataField is valid
		const fields = this.getAvailableDataField();
		if (fields.length) {
			this.props.onPropChange(
				`list-${this.props.filterCount + 1}`,
				this.state.listComponentProps,
			);
			this.props.setFilterCount(this.props.filterCount + 1);
			this.setState(
				{
					showModal: false,
				},
				this.resetNewComponentData,
			);
		} else {
			this.setState({
				showModal: false,
			});
		}
	};

	handleCancel = () => {
		this.setState(
			{
				showModal: false,
			},
			this.resetNewComponentData,
		);
	};

	handleDataFieldChange = (item) => {
		const dataField = item.key;

		this.setState({
			listComponentProps: {
				...this.state.listComponentProps,
				dataField,
			},
		});
	};

	handleSwitchPropChange = (name, value) => {
		this.setState({
			listComponentProps: {
				...this.state.listComponentProps,
				[name]: value,
			},
		});
	};

	handlePropChange = (e) => {
		const { name, value, type } = e.target;
		this.setState({
			listComponentProps: {
				...this.state.listComponentProps,
				[name]: type === 'number' ? parseInt(value, 10) : value,
			},
		});
	};

	renderFormItem = (item, name) => {
		let FormInput = null;
		// always set to default value
		const value = item.default;

		switch (item.input) {
			case 'bool': {
				FormInput = (
					<Switch
						defaultChecked={value}
						onChange={val => this.handleSwitchPropChange(name, val)}
					/>
				);
				break;
			}
			case 'number': {
				FormInput = (
					<Input
						name={name}
						defaultValue={value}
						onChange={this.handlePropChange}
						type="number"
						placeholder={`Enter ${name} here`}
					/>
				);
				break;
			}
			default: {
				FormInput = (
					<Input
						name={name}
						defaultValue={value}
						onChange={this.handlePropChange}
						placeholder={`Enter ${name} here`}
					/>
				);
				break;
			}
		}

		return (
			<Form.Item label={item.label} colon={false} key={name}>
				<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
					{item.description}
				</div>
				{FormInput}
			</Form.Item>
		);
	};

	renderPropsForm = () => {
		const fields = this.getAvailableDataField();
		if (!fields.length) {
			return (
				<p>
					There are no compatible fields present in your data
					mappings. <a href={this.props.mappingsURL}>You can edit your mappings</a> to
					add filters (agggregation components).
				</p>
			);
		}

		const { dataField } = this.state.listComponentProps;
		const menu = (
			<Menu
				onClick={this.handleDataFieldChange}
				style={{ maxHeight: 300, overflowY: 'scroll' }}
			>
				{fields.map(item => <Menu.Item key={item}>{item}</Menu.Item>)}
			</Menu>
		);
		return (
			<Form onSubmit={this.handleSubmit} className={formWrapper}>
				<Form.Item label={multiListTypes.dataField.label} colon={false}>
					<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
						{multiListTypes.dataField.description}
					</div>
					<Dropdown overlay={menu} trigger={['click']}>
						<Button
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							{dataField} <Icon type="down" />
						</Button>
					</Dropdown>
				</Form.Item>
				{Object.keys(multiListTypes)
					.filter(item => item !== 'dataField')
					.map(item => this.renderFormItem(multiListTypes[item], item))}
			</Form>
		);
	};

	renderAsTree = (res, key = '0') => {
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
						key={`${key}-${index + 1}`}
					/>
				);
			}
			const hasObject = res[item] === undefined && typeof item !== 'string';
			const node = hasObject ? item : res[item];
			return (
				<TreeNode
					title={
						typeof item !== 'string'
							? 'Object'
							: `${node || Array.isArray(res) ? item : `${item}: null`}`
					}
					key={`${key}-${index + 1}`}
				>
					{this.renderAsTree(node, `${key}-${index + 1}`)}
				</TreeNode>
			);
		});
	};

	renderAsJSON = res => (
		<div style={{ textAlign: 'right' }}>
			<Popover
				placement="leftTop"
				content={<pre style={{ width: 300 }}>{JSON.stringify(res, null, 4)}</pre>}
				title={
					<Row>
						<Col span={22}>
							<h6 style={{ display: 'inline-block' }}>JSON Result</h6>
						</Col>
						<Col span={2}>
							<Tooltip visible={this.state.copied} title="Copied">
								<Button
									shape="circle"
									icon="copy"
									size="small"
									onClick={() => this.copyJSON(res)}
								/>
							</Tooltip>
						</Col>
					</Row>
				}
			>
				<Button>View as JSON</Button>
			</Popover>
		</div>
	);

	render() {
		let resultComponentProps = this.props.componentProps.result || {};
		resultComponentProps = {
			size: 5,
			pagination: true,
			sortBy: 'asc',
			paginationAt: 'bottom',
			...resultComponentProps,
			onData: res => (
				<div className={listItem} key={res._id}>
					<ExpandCollapse previewHeight="390px" expandText="Show more">
						{this.renderAsJSON(res)}
						{<Tree showLine>{this.renderAsTree(res)}</Tree>}
					</ExpandCollapse>
				</div>
			),
			react: {
				and: Object.keys(this.props.componentProps).filter(item => item !== 'result'),
			},
		};

		return (
			<ReactiveBase
				app={this.props.appName}
				credentials={this.props.credentials}
				url={this.props.url}
			>
				<Row gutter={16} style={{ padding: 20 }}>
					<Col span={6}>
						<Card title="Configure Search">
							<Button
								style={{ width: '100%' }}
								size="large"
								icon="plus-circle-o"
								onClick={this.showModal}
							>
								Add New Filter
							</Button>
						</Card>
						{Object.keys(this.props.componentProps)
							.filter(item => item !== 'search' && item !== 'result')
							.map(config => (
								<Card key={config} style={{ marginTop: 20 }}>
									<RSWrapper
										id={config}
										component="MultiList"
										mappings={this.props.mappings}
										componentProps={this.props.componentProps[config] || {}}
										onPropChange={this.props.onPropChange}
										onDelete={this.props.deleteComponent}
										full
									/>
								</Card>
							))}
					</Col>
					<Col span={18}>
						<Card>
							<RSWrapper
								id="search"
								component="DataSearch"
								mappings={this.props.mappings}
								componentProps={this.props.componentProps.search || {}}
								onPropChange={this.props.onPropChange}
							/>
						</Card>

						<Card>
							<SelectedFilters />
							<RSWrapper
								id="result"
								component="ReactiveList"
								mappings={this.props.mappings}
								componentProps={resultComponentProps}
								onPropChange={this.props.onPropChange}
								full
								showDelete={false}
							/>
						</Card>
					</Col>

					<Modal
						title="Add New Filter"
						visible={this.state.showModal}
						onOk={this.handleOk}
						onCancel={this.handleCancel}
						destroyOnClose
					>
						{this.renderPropsForm()}
					</Modal>
				</Row>
			</ReactiveBase>
		);
	}
}

Editor.defaultProps = {
	mappingsURL: '/mappings',
};
