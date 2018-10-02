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

import {
 DataSearch, MultiList, ReactiveList, CategorySearch,
} from '@appbaseio/reactivesearch';

import getNestedValue from '../utils';
import dataSearchTypes from '../utils/datasearch-types';
import multiListTypes from '../utils/multilist-types';
import reactiveListTypes from '../utils/reactivelist-types';
import categorySearchTypes from '../utils/categorysearch-types';
import { generateDataField, generateFieldWeights } from '../utils/dataField';
import constants from '../utils/constants';
import { getComponentCode } from '../template';
import PreviewList from './PreviewList';

import {
	deleteStyles,
	rowStyles,
	formWrapper,
	componentStyles,
	fieldBadge,
	label,
} from '../styles';

const componentMap = {
	CategorySearch,
	DataSearch,
	MultiList,
	ReactiveList,
};

const propsMap = {
	DataSearch: dataSearchTypes,
	MultiList: multiListTypes,
	ReactiveList: reactiveListTypes,
	CategorySearch: categorySearchTypes,
};

export default class RSWrapper extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showModal: false,
			componentProps: props.componentProps,
			error: '',
			previewModal: false,
		};

		if (!props.componentProps.dataField) {
			// set default dataField for the component if not defined
			const dataFields = this.getAvailableDataField();
			const { multiple } = propsMap[this.props.component].dataField;
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
		const { types } = propsMap[this.props.component].dataField;

		if (this.props.id === 'search') {
			return Object.keys(this.props.mappings).filter(field => types.includes(this.props.mappings[field].type));
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

	getCategoryField = () => {
		const types = propsMap[this.props.component].categoryField.types;

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
	}

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

	handleDropdownChange = (e, name) => {
		const value = e.key;
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
				dataField: this.state.componentProps.dataField.filter(
					(i, index) => index !== deleteIndex,
				),
				fieldWeights: this.state.componentProps.fieldWeights.filter(
					(i, index) => index !== deleteIndex,
				),
			},
		});
	};

	handleMultipleDropdown = (value, name) => {
		let selectedValue = value;
		if (selectedValue.includes('*')) {
			selectedValue = ['*'];
		}
		this.setState({
			componentProps: {
				...this.state.componentProps,
				[name]: selectedValue,
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
		const field = this.getAvailableDataField().find(
			item => !this.state.componentProps.dataField.includes(item),
		);

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

	handlePreviewModal = () => {
		this.setState({
			previewModal: !this.state.previewModal,
		});
	};

	handleSavePreview = (values) => {
		this.props.onPropChange(this.props.id, {
			meta: true,
			metaFields: values,
		});
		this.setState({
			previewModal: false,
		});
	};

	renderComponentCode = () => {
		const config = {
			componentId: this.props.id,
			component: this.props.component,
			mappings: this.props.mappings,
			componentProps: this.props.componentProps,
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
										|| !this.state.componentProps.dataField.includes(item),
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
		const value = this.props.componentProps[name] !== undefined
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
			case 'multiDropdown': {
				const { Option } = Select;

				let dropdownOptions = propsMap[this.props.component][name].options || [];
				const placeholder = propsMap[this.props.component][name].description || '';
				const { label: currentLabel } = propsMap[this.props.component][name];

				let dropdownValue = [];
				let disable = false;
				let allFields = '';

				switch (name) {
					case 'includeFields': {
						allFields = '* ( Include all Fields )';
						dropdownValue =							this.state.componentProps.includeFields
							|| propsMap[this.props.component][name].default;

						if (dropdownValue.includes('*')) {
							dropdownValue = ['*'];
							dropdownOptions = [];
						}

						const excludeFields =							this.state.componentProps.excludeFields
							|| propsMap[this.props.component].excludeFields.default;
						if (excludeFields.includes('*')) {
							disable = true;
							dropdownValue = [];
						}
						dropdownOptions = Object.keys(this.props.mappings).filter(
							v => !excludeFields.includes(v),
						);
						break;
					}
					case 'excludeFields': {
						allFields = '* ( Exclude all Fields )';
						dropdownValue =							this.state.componentProps.excludeFields
							|| propsMap[this.props.component][name].default;

						if (dropdownValue.includes('*')) {
							dropdownValue = ['*'];
							dropdownOptions = [];
						}

						const includeFields =							this.state.componentProps.includeFields
							|| propsMap[this.props.component].includeFields.default;

						if (includeFields.includes('*')) {
							disable = true;
							dropdownValue = [];
						}

						dropdownOptions = Object.keys(this.props.mappings).filter(
							v => !includeFields.includes(v),
						);
						break;
					}
					default:
				}

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
									<span className={fieldBadge}>{this.props.mappingsType}</span>
								</Option>
							))}
						</Select>
					</div>
				);
			}
			case 'dropdown': {
				let dropdownOptions = [];
				let selectedValue = '';
				let selectedDropdown = {};
				let noOptionsMessage = '';

				if (name === 'categoryField') {
					noOptionsMessage = <p style={{ lineHeight: '1.5' }}>There are no compatible fields present in your data mappings. <a href={this.props.mappingsURL}>You can edit your mappings</a> (agggregation components)</p>;

					this.getCategoryField().forEach(field => dropdownOptions.push({ label: field, key: field }));

					if (dropdownOptions.length) {
						if (!this.state.componentProps.categoryField) {
							this.props.onPropChange(this.props.id, {
								categoryField: dropdownOptions[0].label,
							});
						}

						selectedDropdown = dropdownOptions.find(option => option.key === this.state.componentProps[name]);
						selectedValue = selectedDropdown
						? selectedDropdown.label
						: dropdownOptions[0].label;
					}
				} else {
					dropdownOptions = propsMap[this.props.component][name].options;
					selectedDropdown = dropdownOptions.find(option => option.key === this.state.componentProps[name]);
					selectedValue = selectedDropdown
						? selectedDropdown.label
						: propsMap[this.props.component][name].default;
				}
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

				FormInput = dropdownOptions.length ? (
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
				) : noOptionsMessage;
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
		if (this.props.component === 'CategorySearch') {
			otherProps = {
				categoryField: generateDataField(
					'MultiList',
					this.props.componentProps.categoryField,
					this.props.mappings,
				),
				fieldWeights: generateFieldWeights(
					this.props.componentProps.dataField,
					this.props.componentProps.fieldWeights,
					this.props.mappings,
				),
				highlightField: this.props.componentProps.dataField,
			};
		}
		const { componentProps: { metaFields, ...restProps } } = this.props;
		const isMetaDataPresent = metaFields && metaFields.title && metaFields.description;

		if (this.props.id === 'result' && isMetaDataPresent) {
			const {
				url: urlKey, title: titleKey, image: imageKey, description: descriptionKey,
			} = metaFields;
			otherProps = {
				onData: (res) => {
					const url = getNestedValue(res, urlKey);
					const title = getNestedValue(res, titleKey);
					const description = getNestedValue(res, descriptionKey);
					const image = getNestedValue(res, imageKey);

					return (
					<Row type="flex" key={res._id} style={{ margin: '20px auto', borderBottom: '1px solid #ededed' }}>
						<Col span={image ? 6 : 0}>
							<img style={{ width: '100%' }} src={image} alt={title} />
						</Col>
						<Col span={image ? 18 : 24}>
							<h3 style={{ fontWeight: '600' }}>{title}</h3>
							<p style={{ fontSize: '1em' }}>{description}</p>
						</Col>
						<div style={{ width: '100%', marginBottom: '10px', textAlign: 'right' }}>
							{url ? <Button shape="circle" icon="link" style={{ marginRight: '5px' }} onClick={() => window.open(url, '_blank')} />
	 : null}
							{this.props.renderJSONEditor(res)}
							{this.props.renderDeleteJSON(res)}
						</div>
					</Row>
				);
},
			};
		}

		const showPreview =			this.props.component === 'ReactiveList';
		const customComponentProps = this.props.customProps[this.props.component];

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
							{this.renderComponentCode()}
							{showPreview ? (
								<Button
									icon="eye-o"
									shape="circle"
									size="large"
									style={{ marginLeft: 8 }}
									onClick={this.handlePreviewModal}
								/>
							) : null}
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
					<Col span={this.props.full ? 24 : 20}>
						<RSComponent
							componentId={this.props.id}
							{...restProps}
							dataField={generateDataField(
								this.props.component,
								this.props.componentProps.dataField,
								this.props.mappings,
							)}
							className={componentStyles}
							fuzziness={this.props.componentProps.fuzziness || 0}
							size={parseInt(this.props.componentProps.size || 10, 10)}
							{...otherProps}
							{...customComponentProps}
						/>
					</Col>
					{this.props.full ? null : (
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
					title={constants[this.props.component]}
					visible={this.state.showModal}
					onOk={this.handleOk}
					onCancel={this.handleCancel}
					destroyOnClose
					key="EditModal"
					okText="Save"
				>
					{this.renderPropsForm()}
				</Modal>
				{showPreview ? (
					<PreviewList
						options={Object.keys(this.props.mappings)}
						componentProps={this.state.componentProps}
						componentId={this.props.id}
						getNestedValue={getNestedValue}
						handlePreviewModal={this.handlePreviewModal}
						handleSavePreview={this.handleSavePreview}
						visible={this.state.previewModal}
						dataField={generateDataField(
							this.props.component,
							this.props.componentProps.dataField,
							this.props.mappings,
						)}
					/>
				) : null}
			</div>
		);
	}
}

RSWrapper.defaultProps = {
	showDelete: true,
};
