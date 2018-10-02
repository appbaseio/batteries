import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Switch,
	Button,
	Modal,
	Table,
	Menu,
	Icon,
	Dropdown,
	Popover,
	Select,
} from 'antd';

import { DataSearch, MultiList, ReactiveList } from '@appbaseio/reactivesearch';

import dataSearchTypes from '../utils/datasearch-types';
import multiListTypes from '../utils/multilist-types';
import reactiveListTypes from '../utils/reactivelist-types';
import { generateDataField, generateFieldWeights } from '../utils/dataField';
import constants from '../utils/constants';
import { getComponentCode } from '../template';

import {
	deleteStyles,
	rowStyles,
	formWrapper,
	componentStyles,
	fieldBadge,
	label,
} from '../styles';

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
			const { component } = props;
			const dataFields = this.getAvailableDataField();
			const { multiple } = propsMap[component].dataField;
			let otherProps = {};
			if (props.id === 'search') {
				otherProps = { fieldWeights: [1] };
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
		const { component, mappings, id } = this.props;
		const { types } = propsMap[component].dataField;

		if (id === 'search') {
			return Object.keys(mappings).filter(field => types.includes(mappings[field].type));
		}

		const fields = Object.keys(mappings).filter((field) => {
			let fieldsToCheck = [mappings[field]];

			if (mappings[field].originalFields) {
				fieldsToCheck = [
					...fieldsToCheck,
					...Object.values(mappings[field].originalFields),
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
		const { componentProps } = this.props;
		this.setState({
			componentProps,
		});
	};

	showModal = () => {
		this.setState({
			showModal: true,
		});
	};

	handleOk = () => {
		const { onPropChange, id } = this.props;
		const { componentProps } = this.state;
		onPropChange(id, componentProps);
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
		const { componentProps } = this.state;
		this.setState({
			componentProps: {
				...componentProps,
				dataField,
			},
		});
	};

	handleSwitchPropChange = (name, value) => {
	const { componentProps } = this.state;
		this.setState({
			componentProps: {
				...componentProps,
				[name]: value,
			},
		});
	};

	handlePropChange = (e) => {
		const { name, value } = e.target;
		const { componentProps } = this.state;
		this.setState({
			componentProps: {
				...componentProps,
				[name]: value,
			},
		});
	};

	handleDropdownChange = (e, name) => {
		const { componentProps } = this.state;
		const value = e.key;
		this.setState({
			componentProps: {
				...componentProps,
				[name]: value,
			},
		});
	};

	handleSearchDataFieldChange = (item) => {
		const field = item.key;
		const index = item.item.props.value;
		const { componentProps } = this.state;

		const dataField = Object.assign([], componentProps.dataField, {
			[index]: field,
		});
		this.setState({
			componentProps: {
				...componentProps,
				dataField,
			},
		});
	};

	handleSearchDataFieldDelete = (deleteIndex) => {
	const { componentProps } = this.state;
		this.setState({
			componentProps: {
				...componentProps,
				dataField: componentProps.dataField.filter(
					(i, index) => index !== deleteIndex,
				),
				fieldWeights: componentProps.fieldWeights.filter(
					(i, index) => index !== deleteIndex,
				),
			},
		});
	};

	handleMultipleDropdown = (value, name) => {
		let selectedValue = value;
		const { componentProps } = this.state;
		if (selectedValue.includes('*')) {
			selectedValue = ['*'];
		}
		this.setState({
			componentProps: {
				...componentProps,
				[name]: selectedValue,
			},
		});
	};

	handleSearchWeightChange = (index, value) => {
	const { componentProps } = this.state;
		const fieldWeights = Object.assign([], componentProps.fieldWeights, {
			[index]: value,
		});
		this.setState({
			componentProps: {
				...componentProps,
				fieldWeights,
			},
		});
	};

	handleAddFieldRow = () => {
	const { componentProps } = this.state;
		const field = this.getAvailableDataField().find(
			item => !componentProps.dataField.includes(item),
		);

		if (field) {
			this.setState({
				componentProps: {
					...componentProps,
					dataField: [...componentProps.dataField, field],
					fieldWeights: [...componentProps.fieldWeights, 2],
				},
			});
		}
	};

	renderComponentCode = () => {
		const {
			id, component, mappings, componentProps,
		} = this.props;
		const config = {
			componentId: id,
			component,
			mappings,
			componentProps,
		};
		const code = getComponentCode(config);
		return (
			<Popover content={<pre>{code}</pre>} placement="leftTop" title="Code">
				<Button icon="code-o" shape="circle" size="large" style={{ marginLeft: 8 }} />
			</Popover>
		);
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
		const { componentProps } = this.state;
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
								.filter(
									item => item === selected
										|| !componentProps.dataField.includes(item),
								)
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

		const dataSource = componentProps.dataField.map((field, index) => ({
			key: field,
			field,
			weight: componentProps.fieldWeights[index],
		}));

		return (
			<React.Fragment>
				<Table
					dataSource={dataSource}
					columns={columns}
					pagination={false}
					rowClassName={rowStyles}
				/>
				{fields.length === componentProps.dataField.length ? null : (
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
	const { componentProps, mappings } = this.props;
		let FormInput = null;
		const value = componentProps[name] !== undefined
				? componentProps[name]
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
			case 'multiDropdown': {
				const { Option } = Select;
				const { component } = this.props;
				let dropdownOptions = propsMap[component][name].options || [];
				const placeholder = propsMap[component][name].description || '';
				const { label: currentLabel } = propsMap[component][name];

				let dropdownValue = [];
				let disable = false;
				let allFields = '';

				switch (name) {
					case 'includeFields': {
						const { componentProps: stateComponentProps } = this.state;
						allFields = '* ( Include all Fields )';
						dropdownValue =	stateComponentProps.includeFields
							|| propsMap[component][name].default;

						if (dropdownValue.includes('*')) {
							dropdownValue = ['*'];
							dropdownOptions = [];
						}

						const excludeFields =	stateComponentProps.excludeFields
							|| propsMap[component].excludeFields.default;
						if (excludeFields.includes('*')) {
							disable = true;
							dropdownValue = [];
						}
						dropdownOptions = Object.keys(mappings).filter(
							v => !excludeFields.includes(v),
						);
						break;
					}
					case 'excludeFields': {
						const { componentProps: stateComponentProps } = this.state;
						allFields = '* ( Exclude all Fields )';
						dropdownValue =	stateComponentProps.excludeFields
							|| propsMap[component][name].default;

						if (dropdownValue.includes('*')) {
							dropdownValue = ['*'];
							dropdownOptions = [];
						}

						const includeFields =	stateComponentProps.includeFields
							|| propsMap[component].includeFields.default;

						if (includeFields.includes('*')) {
							disable = true;
							dropdownValue = [];
						}

						dropdownOptions = Object.keys(mappings).filter(
							v => !includeFields.includes(v),
						);
						break;
					}
					default:
				}
				const { mappingsType } = this.props;
				return (
					<div className="ant-row ant-form-item ant-form-item-no-colon">
						<div className="ant-form-item-label">
							<label className={label} title={currentLabel}>
								{currentLabel}
							</label>
						</div>
						<Select
							key={name}
							mode="multiple"
							style={{ width: '100%' }}
							disabled={disable}
							placeholder={placeholder}
							value={dropdownValue}
							onChange={selectedValue => this.handleMultipleDropdown(selectedValue, name)
							}
						>
							{allFields ? <Option key="*">{allFields}</Option> : null}
							{dropdownOptions.map(option => (
								<Option key={option}>
									{option}
									<span className={fieldBadge}>{mappingsType}</span>
								</Option>
							))}
						</Select>
					</div>
				);
			}
			case 'dropdown': {
				const { component } = this.props;
				const { componentProps: stateComponentProps } = this.state;
				const dropdownOptions = propsMap[component][name].options;
				const selectedDropdown = dropdownOptions.find(
					option => option.key === stateComponentProps[name],
				);
				const selectedValue = selectedDropdown
					? selectedDropdown.label
					: propsMap[component][name].default;
				const menu = (
					<Menu
						onClick={e => this.handleDropdownChange(e, name)}
						style={{ maxHeight: 300, overflowY: 'scroll' }}
					>
						{dropdownOptions.map(({ label: dropLabel, key }) => (
							<Menu.Item key={key}>{dropLabel}</Menu.Item>
						))}
					</Menu>
				);

				FormInput = (
					<Dropdown overlay={menu} trigger={['click']}>
						<Button
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							{selectedValue} <Icon type="down" />
						</Button>
					</Dropdown>
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
		const { componentProps: stateComponentProps, error } = this.state;
		const { component, id } = this.props;
		const propNames = propsMap[component];
		const { dataField } = stateComponentProps;
		const fields = this.getAvailableDataField();
		const menu = (
			<Menu
				onClick={this.handleDataFieldChange}
				style={{ maxHeight: 300, overflowY: 'scroll' }}
			>
				{fields.map(item => (
					<Menu.Item key={item}>{item}</Menu.Item>
				))}
			</Menu>
		);

		return (
			<Form onSubmit={this.handleSubmit} className={formWrapper}>
				<Form.Item label={propNames.dataField.label} colon={false}>
					<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
						{propNames.dataField.description}
					</div>
					{error ? (
						<div
							style={{ color: 'tomato', margin: '0 0 6px' }}
							className="ant-form-extra"
						>
							{error}
						</div>
					) : null}
					{id === 'search' ? (
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
		const {
			componentProps, component, id, mappings, customProps, full, showDelete, onDelete,
		} = this.props;
		const { showModal } = this.state;
		if (!componentProps.dataField) return null;
		const RSComponent = componentMap[component];

		let otherProps = {};
		if (id === 'search') {
			otherProps = {
				fieldWeights: generateFieldWeights(
					componentProps.dataField,
					componentProps.fieldWeights,
					mappings,
				),
				highlightField: componentProps.dataField,
			};
		}

		const customComponentProps = customProps[component];

		return (
			<div>
				<Row gutter={8}>
					{full ? (
						<Col span={24} style={{ textAlign: 'right', paddingBottom: 16 }}>
							<Button
								icon="edit"
								shape="circle"
								size="large"
								onClick={this.showModal}
							/>
							{this.renderComponentCode()}
							{showDelete ? (
								<Button
									icon="delete"
									shape="circle"
									type="danger"
									size="large"
									style={{ marginLeft: 8 }}
									onClick={() => onDelete(id)}
								/>
							) : null}
						</Col>
					) : null}
					<Col span={full ? 24 : 20}>
						<RSComponent
							componentId={id}
							{...componentProps}
							dataField={generateDataField(
								component,
								componentProps.dataField,
								mappings,
							)}
							{...otherProps}
							className={componentStyles}
							fuzziness={componentProps.fuzziness || 0}
							size={parseInt(componentProps.size || 10, 10)}
							{...customComponentProps}
						/>
					</Col>
					{full ? null : (
						<Col span={4} style={{ textAlign: 'right' }}>
							<Button
								icon="edit"
								shape="circle"
								size="large"
								onClick={this.showModal}
							/>
							{this.renderComponentCode()}
						</Col>
					)}
				</Row>

				<Modal
					title={constants[component]}
					visible={showModal}
					onOk={this.handleOk}
					onCancel={this.handleCancel}
					destroyOnClose
					okText="Save"
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
