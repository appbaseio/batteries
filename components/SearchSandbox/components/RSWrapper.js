import React, { Component } from 'react';
import { Row, Col, Form, Input, Switch, Button, Modal, Table, Menu, Icon, Dropdown } from 'antd';

import { DataSearch, MultiList, ReactiveList } from '@appbaseio/reactivesearch';

import dataSearchTypes from '../utils/datasearch-types';
import multiListTypes from '../utils/multilist-types';
import reactiveListTypes from '../utils/reactivelist-types';
import { generateDataField, generateFieldWeights } from '../utils/dataField';
import constants from '../utils/constants';

import { deleteStyles, rowStyles, formWrapper, componentStyles } from '../styles';

const componentMap = {
	DataSearch,
	MultiList,
	ReactiveList,
};

const propsMap = {
	DataSearch: dataSearchTypes,
	MultiList: multiListTypes,
	ReactiveList: reactiveListTypes,
};

export default class RSWrapper extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showModal: false,
			componentProps: props.componentProps,
			error: '',
		};

		if (!props.componentProps.dataField) {
			// set default dataField for the component if not defined
			const dataFields = this.getAvailableDataField();
			const { multiple } = propsMap[this.props.component].dataField;
			let otherProps = {};
			if (props.id === 'search') {
				otherProps = { fieldWeights: [2] };
			}

			props.onPropChange(props.id, {
				dataField: multiple ? [dataFields[0]] : dataFields[0],
				...otherProps,
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			componentProps: nextProps.componentProps,
		});
	}

	getAvailableDataField = () => {
		const { types } = propsMap[this.props.component].dataField;

		if (this.props.id === 'search') {
			return Object.keys(this.props.mappings).filter(field =>
				types.includes(this.props.mappings[field].type));
		}

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

	setError = (error) => {
		this.setState(
			{
				error,
			},
			() => {
				setTimeout(() => {
					this.setState({
						error: '',
					});
				}, 3000);
			},
		);
	};

	resetComponentProps = () => {
		this.setState({
			componentProps: this.props.componentProps,
		});
	};

	showModal = () => {
		this.setState({
			showModal: true,
		});
	};

	handleOk = () => {
		this.props.onPropChange(this.props.id, this.state.componentProps);
		this.setState({
			showModal: false,
		});
	};

	handleCancel = () => {
		this.resetComponentProps();
		this.setState({
			showModal: false,
		});
	};

	handleDataFieldChange = (item) => {
		const dataField = item.key;

		this.setState({
			componentProps: {
				...this.state.componentProps,
				dataField,
			},
		});
	};

	handleSwitchPropChange = (name, value) => {
		this.setState({
			componentProps: {
				...this.state.componentProps,
				[name]: value,
			},
		});
	};

	handlePropChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			componentProps: {
				...this.state.componentProps,
				[name]: value,
			},
		});
	};

	handleSearchDataFieldChange = (item) => {
		const field = item.key;
		const index = item.item.props.value;

		const dataField = Object.assign([], this.state.componentProps.dataField, {
			[index]: field,
		});
		this.setState({
			componentProps: {
				...this.state.componentProps,
				dataField,
			},
		});
	};

	handleSearchDataFieldDelete = (deleteIndex) => {
		this.setState({
			componentProps: {
				...this.state.componentProps,
				dataField: this.state.componentProps.dataField
					.filter((i, index) => index !== deleteIndex),
				fieldWeights: this.state.componentProps.fieldWeights
					.filter((i, index) => index !== deleteIndex),
			},
		});
	};

	handleSearchWeightChange = (index, value) => {
		const fieldWeights = Object.assign([], this.state.componentProps.fieldWeights, {
			[index]: value,
		});
		this.setState({
			componentProps: {
				...this.state.componentProps,
				fieldWeights,
			},
		});
	};

	handleAddFieldRow = () => {
		const field = this.getAvailableDataField()
			.find(item => !this.state.componentProps.dataField.includes(item));

		if (field) {
			this.setState({
				componentProps: {
					...this.state.componentProps,
					dataField: [...this.state.componentProps.dataField, field],
					fieldWeights: [...this.state.componentProps.fieldWeights, 2],
				},
			});
		}
	};

	renderDeleteButton = (x, y, index) => (
		<Button
			className={deleteStyles}
			icon="delete"
			shape="circle"
			type="danger"
			onClick={() => this.handleSearchDataFieldDelete(index)}
		/>
	);

	renderDataFieldTable = () => {
		const fields = this.getAvailableDataField();
		const columns = [
			{
				title: 'Field',
				dataIndex: 'field',
				key: 'field',
				render: (selected, x, index) => {
					const menu = (
						<Menu
							onClick={this.handleSearchDataFieldChange}
							style={{ maxHeight: 300, overflowY: 'scroll' }}
						>
							{fields
								.filter(item =>
										item === selected ||
										!this.state.componentProps.dataField.includes(item))
								.map(item => (
									<Menu.Item key={item} value={index}>
										{item}
									</Menu.Item>
								))}
						</Menu>
					);
					return (
						<Dropdown overlay={menu} trigger={['click']}>
							<Button style={{ marginLeft: 8 }}>
								{selected} <Icon type="down" />
							</Button>
						</Dropdown>
					);
				},
			},
			{
				title: 'Weight',
				dataIndex: 'weight',
				key: 'weight',
				render: (value, x, index) => (
					<Input
						min={1}
						type="number"
						defaultValue={value}
						onChange={e => this.handleSearchWeightChange(index, e.target.value)}
					/>
				),
			},
			{
				render: this.renderDeleteButton,
			},
		];

		const dataSource = this.state.componentProps.dataField.map((field, index) => ({
			key: field,
			field,
			weight: this.state.componentProps.fieldWeights[index],
		}));

		return (
			<React.Fragment>
				<Table
					dataSource={dataSource}
					columns={columns}
					pagination={false}
					rowClassName={rowStyles}
				/>
				{fields.length === this.state.componentProps.dataField.length ? null : (
					<div style={{ paddingTop: 12, textAlign: 'right' }}>
						<Button
							onClick={this.handleAddFieldRow}
							type="primary"
							style={{ marginBottom: 16 }}
						>
							Add a new field
						</Button>
					</div>
				)}
			</React.Fragment>
		);
	};

	renderFormItem = (item, name) => {
		let FormInput = null;
		const value =
			this.props.componentProps[name] !== undefined
				? this.props.componentProps[name]
				: item.default;

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
		const propNames = propsMap[this.props.component];
		const { dataField } = this.state.componentProps;
		const fields = this.getAvailableDataField();
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
				<Form.Item label={propNames.dataField.label} colon={false}>
					<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
						{propNames.dataField.description}
					</div>
					{this.state.error ? (
						<div
							style={{ color: 'tomato', margin: '0 0 6px' }}
							className="ant-form-extra"
						>
							{this.state.error}
						</div>
					) : null}
					{this.props.id === 'search' ? (
						this.renderDataFieldTable()
					) : (
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
					)}
				</Form.Item>
				{Object.keys(propNames)
					.filter(item => item !== 'dataField')
					.map(item => this.renderFormItem(propNames[item], item))}
			</Form>
		);
	};

	render() {
		if (!this.props.componentProps.dataField) return null;
		const RSComponent = componentMap[this.props.component];

		let otherProps = {};
		if (this.props.id === 'search') {
			otherProps = {
				fieldWeights: generateFieldWeights(
					this.props.componentProps.dataField,
					this.props.componentProps.fieldWeights,
					this.props.mappings,
				),
				highlightField: this.props.componentProps.dataField,
			};
		}

		return (
			<div>
				<Row gutter={8}>
					{this.props.full ? (
						<Col span={24} style={{ textAlign: 'right', paddingBottom: 16 }}>
							<Button
								icon="edit"
								shape="circle"
								size="large"
								onClick={this.showModal}
							/>
							{this.props.showDelete ? (
								<Button
									icon="delete"
									shape="circle"
									type="danger"
									size="large"
									style={{ marginLeft: 8 }}
									onClick={() => this.props.onDelete(this.props.id)}
								/>
							) : null}
						</Col>
					) : null}
					<Col span={this.props.full ? 24 : 22}>
						<RSComponent
							componentId={this.props.id}
							{...this.props.componentProps}
							dataField={generateDataField(
								this.props.component,
								this.props.componentProps.dataField,
								this.props.mappings,
							)}
							{...otherProps}
							className={componentStyles}
							fuzziness={this.props.componentProps.fuzziness || 2}
							size={parseInt(this.props.componentProps.size || 10, 10)}
						/>
					</Col>
					{this.props.full ? null : (
						<Col span={2} style={{ textAlign: 'right' }}>
							<Button
								icon="edit"
								shape="circle"
								size="large"
								onClick={this.showModal}
							/>
						</Col>
					)}
				</Row>

				<Modal
					title={constants[this.props.component]}
					visible={this.state.showModal}
					onOk={this.handleOk}
					onCancel={this.handleCancel}
					destroyOnClose
				>
					{this.renderPropsForm()}
				</Modal>
			</div>
		);
	}
}

RSWrapper.defaultProps = {
	showDelete: true,
};
