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
	message,
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
			isInputActive: false,
			searchTerm: '',
			previewModal: false,
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

	getCategoryField = () => {
		const { component, mappings } = this.props;
		const { categoryField: { types } } = propsMap[component];

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
		message.success('Search Preview configuration saved');
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

	handleDropdownBlur = () => {
		this.setState({
			isInputActive: false,
		});
	}

	handleDropdownChange = (e, name) => {
		const { componentProps } = this.state;
		const value = e.key;
		this.setState({
			isInputActive: false,
			componentProps: {
				...componentProps,
				[name]: value,
			},
		});
	};

	handleDropdownSearch = (e) => {
		const { target: { name, value } } = e;
		this.setState({
			isInputActive: true,
			[name]: value,
		});
	}

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
					fieldWeights: [...componentProps.fieldWeights, 1],
				},
			});
		}
	};

	handlePreviewModal = () => {
		this.setState(({ previewModal: oldValue }) => ({
			previewModal: !oldValue,
		}));
	};

	handleSavePreview = (values) => {
		const { onPropChange, id } = this.props;
		onPropChange(id, {
			meta: true,
			metaFields: values,
		});
		this.setState({
			previewModal: false,
		});
	};

	renderComponentCode = () => {
		const {
			component, id, mappings, componentProps, customProps,
		} = this.props;
		const customComponentProps = customProps[component];

		const config = {
			componentId: id,
			component,
			mappings,
			componentProps,
			customProps: customComponentProps,
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
			case 'dropdown': {
				let dropdownOptions = [];
				let selectedValue = '';
				let selectedDropdown = {};
				let noOptionsMessage = '';

				const {
					onPropChange, id, component, mappingsURL,
				} = this.props;
				const { componentProps: stateComponentProps, isInputActive, searchTerm } = this.state;

				if (name === 'categoryField') {
					noOptionsMessage = <p style={{ lineHeight: '1.5' }}>There are no compatible fields present in your data mappings. <a href={mappingsURL}>You can edit your mappings</a> (agggregation components)</p>;

					this.getCategoryField().forEach(field => dropdownOptions.push({
						label: field,
						key: field,
					}));

					if (dropdownOptions.length) {
						if (!stateComponentProps.categoryField) {
							onPropChange(id, {
								categoryField: dropdownOptions[0].label,
							});
						}

						selectedDropdown = dropdownOptions
							.find(option => option.key === stateComponentProps[name]);
						selectedValue = selectedDropdown
						? selectedDropdown.label
						: dropdownOptions[0].label;
					}
				} else {
					dropdownOptions = propsMap[component][name].options;
					selectedDropdown = dropdownOptions
						.find(option => option.key === stateComponentProps[name]);
					selectedValue = selectedDropdown
						? selectedDropdown.label
						: propsMap[component][name].default;
				}

				if (isInputActive) {
					dropdownOptions = dropdownOptions
						.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()));
				}

				if (!dropdownOptions.length) {
					dropdownOptions.push({ label: 'No options', key: '' });
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
						<Input
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
							name="searchTerm"
							onBlur={this.handleDropdownBlur}
							value={isInputActive ? searchTerm : selectedValue}
							defaultValue={selectedValue}
							onChange={this.handleDropdownSearch}
						/>
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
			componentProps, component, id, mappings, customProps, full, showDelete, onDelete, showCodePreview, showCustomList
		} = this.props;
		const { showModal, componentProps: stateComponentProps, previewModal } = this.state;
		if (!componentProps.dataField) return null;
		const RSComponent = componentMap[component];
		let tutorialClass = '';
		let editTutorialClass = '';
		let otherProps = {};
		if (id === 'search') {
			tutorialClass = 'search-tutorial-1';
			editTutorialClass = 'search-tutorial-2';
			otherProps = {
				fieldWeights: generateFieldWeights(
					componentProps.dataField,
					componentProps.fieldWeights,
					mappings,
				),
				highlightField: componentProps.dataField,
			};
		}
		if (id === 'result') {
			tutorialClass = 'search-tutorial-4';
			editTutorialClass = 'search-tutorial-5';
		}
		if (component === 'CategorySearch') {
			otherProps = {
				categoryField: generateDataField(
					'MultiList',
					componentProps.categoryField,
					mappings,
				),
				fieldWeights: generateFieldWeights(
					componentProps.dataField,
					componentProps.fieldWeights,
					mappings,
				),
				highlightField: componentProps.dataField,
			};
		}
		const { componentProps: { metaFields, ...restProps } } = this.props;
		const isMetaDataPresent = metaFields && metaFields.title && metaFields.description;

		if (id === 'result' && isMetaDataPresent) {
			const {
				url: urlKey, title: titleKey, image: imageKey, description: descriptionKey,
			} = metaFields;
			otherProps = {
					onData: (res) => {
						const url = getNestedValue(res, urlKey);
						const title = getNestedValue(res, titleKey);
						const description = getNestedValue(res, descriptionKey);
						const image = getNestedValue(res, imageKey);
						const { renderJSONEditor, renderDeleteJSON } = this.props;

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
								{renderJSONEditor(res)}
								{renderDeleteJSON(res)}
							</div>
						</Row>
					);
				},
			};
		}

		if (id === 'result' && componentProps.sortBy === 'best') {
			delete restProps.sortBy;
		}

		const showPreview =	component === 'ReactiveList';
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
								className={editTutorialClass}
								onClick={this.showModal}
							/>
							{showCodePreview && this.renderComponentCode()}
							{showPreview && showCustomList ? (
								<Button
									icon="eye-o"
									shape="circle"
									size="large"
									style={{ marginLeft: 8 }}
									onClick={this.handlePreviewModal}
								/>
							) : null}
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
					<Col span={full ? 24 : 20} id={id} className={tutorialClass}>
						<RSComponent
							componentId={id}
							{...restProps}
							dataField={generateDataField(
								component,
								componentProps.dataField,
								mappings,
							)}
							className={componentStyles}
							fuzziness={componentProps.fuzziness || 0}
							size={parseInt(componentProps.size || 10, 10)}
							{...otherProps}
							{...customComponentProps}
						/>
					</Col>
					{full ? null : (
						<Col span={4} style={{ textAlign: 'right' }}>
							<Button
								icon="edit"
								shape="circle"
								size="large"
								className={editTutorialClass}
								onClick={this.showModal}
							/>
							{showCodePreview && this.renderComponentCode()}
						</Col>
					)}
				</Row>

				<Modal
					title={constants[component]}
					visible={showModal}
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
						options={Object.keys(mappings)}
						componentProps={stateComponentProps}
						componentId={id}
						getNestedValue={getNestedValue}
						handlePreviewModal={this.handlePreviewModal}
						handleSavePreview={this.handleSavePreview}
						visible={previewModal}
						dataField={generateDataField(
							component,
							componentProps.dataField,
							mappings,
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
