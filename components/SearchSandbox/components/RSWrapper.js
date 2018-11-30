import React, { Component } from 'react';
import {
 Row, Col, Form, Button, Modal, Table, Popover, message,
} from 'antd';

import {
 DataSearch, MultiList, ReactiveList, CategorySearch,
} from '@appbaseio/reactivesearch';

import dataSearchTypes from '../utils/datasearch-types';
import multiListTypes from '../utils/multilist-types';
import reactiveListTypes from '../utils/reactivelist-types';
import categorySearchTypes from '../utils/categorysearch-types';
import { generateDataField } from '../utils/dataField';
import constants from '../utils/constants';
import { getComponentCode } from '../template';
import PreviewList from './PreviewList';
import { SandboxContext } from '../index';
import getComponentProps from '../utils/getComponentProps';
import {
	NumberInput, TextInput, DropdownInput, ToggleInput,
} from '../../shared/Input';
import {
	deleteStyles, rowStyles, formWrapper, componentStyles,
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

const RSWrapper = props => (
	<SandboxContext.Consumer>
		{contextValue => <RSComponentRender {...contextValue} {...props} />}
	</SandboxContext.Consumer>
);

class RSComponentRender extends Component {
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
		const {
			categoryField: { types },
		} = propsMap[component];

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

	setComponentProps = (newProps) => {
		const { componentProps } = this.state;
		this.setState({
			componentProps: {
				...componentProps,
				...newProps,
			},
		});
	};

	handleSearchDataFieldChange = (valueObject) => {
		const { componentProps } = this.state;

		const dataField = Object.assign([], componentProps.dataField, {
			...valueObject,
		});
		this.setComponentProps({ dataField });
	};

	handleSearchDataFieldDelete = (deleteIndex) => {
		const { componentProps } = this.state;
		this.setComponentProps({
			dataField: componentProps.dataField.filter((i, index) => index !== deleteIndex),
			fieldWeights: componentProps.fieldWeights.filter(
				(i, index) => index !== deleteIndex,
			),
		})
	};

	handleSearchWeightChange = (newValueObject) => {
		const { componentProps } = this.state;
		const fieldWeights = Object.assign([], componentProps.fieldWeights, {
			...newValueObject,
		});
		this.setComponentProps({ fieldWeights });
	};

	handleAddFieldRow = () => {
		const { componentProps } = this.state;
		const field = this.getAvailableDataField().find(
			item => !componentProps.dataField.includes(item),
		);

		if (field) {
			this.setComponentProps({
				dataField: [...componentProps.dataField, field],
				fieldWeights: [...componentProps.fieldWeights, 1],
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
			metaFields: values,
		});
		this.setState({
			previewModal: false,
		});
	};

	renderComponentCode = () => {
		const {
			component, id, mappings, componentProps, customProps,
		} = this.props; // prettier-ignore
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
					const options = fields
						.filter(
							item => item === selected || !componentProps.dataField.includes(item),
						)
						.map(item => ({ label: item, key: item }));

					return (
						<DropdownInput
							options={options}
							name={index}
							value={selected}
							handleChange={this.handleSearchDataFieldChange}
						/>
					);
				},
			},
			{
				title: 'Weight',
				dataIndex: 'weight',
				key: 'weight',
				render: (value, x, index) => (
					<NumberInput
						min={1}
						value={Number(value)}
						name={index}
						placeholder="Enter Field Weight"
						handleChange={this.handleSearchWeightChange}
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
		const { componentProps } = this.props;
		let FormInput = null;
		const value = componentProps[name] === undefined ? item.default : componentProps[name];

		switch (item.input) {
			case 'bool': {
				FormInput = (
					<ToggleInput value={value} name={name} handleChange={this.setComponentProps} />
				);
				break;
			}
			case 'number': {
				FormInput = (
					<NumberInput name={name} value={Number(value)} handleChange={this.setComponentProps} />
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
				} = this.props; // prettier-ignore
				const {
					componentProps: stateComponentProps,
					isInputActive,
					searchTerm,
				} = this.state;

				if (name === 'categoryField') {
					noOptionsMessage = (
						<p style={{ lineHeight: '1.5' }}>
							There are no compatible fields present in your data mappings.{' '}
							<a href={mappingsURL}>You can edit your mappings</a> (agggregation
							components)
						</p>
					);

					this.getCategoryField().forEach(field => dropdownOptions.push({
							label: field,
							key: field,
						}));

					if (dropdownOptions.length) {
						// If no categoryfield is selected
						if (!stateComponentProps.categoryField) {
							onPropChange(id, {
								categoryField: dropdownOptions[0].label,
							});
						}

						selectedDropdown = dropdownOptions.find(
							option => option.key === stateComponentProps[name],
						);
						selectedValue = selectedDropdown
							? selectedDropdown.label
							: dropdownOptions[0].label;
					}
				} else {
					dropdownOptions = propsMap[component][name].options;
					selectedDropdown = dropdownOptions.find(
						option => option.key === stateComponentProps[name],
					);
					selectedValue = selectedDropdown
						? selectedDropdown.label
						: propsMap[component][name].default;
				}

				FormInput = (
					<DropdownInput
						options={dropdownOptions}
						handleChange={this.setComponentProps}
						value={selectedValue}
						name={name}
						noOptionsMessage={noOptionsMessage}
					/>
				);
				break;
			}

			default: {
				FormInput = (
					<TextInput name={name} value={value} handleChange={this.setComponentProps} />
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
		const fieldsOptions = [];
		fields.map(field => fieldsOptions.push({
			key: field,
			label: field,
		}));
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
						<DropdownInput
							value={dataField}
							handleChange={this.setComponentProps}
							options={fieldsOptions}
							name="dataField"
							noOptionsMessage="No Fields Present"
						/>
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
			componentProps,
			component,
			id,
			mappings,
			customProps,
			full,
			showDelete,
			onDelete,
			showCodePreview,
			showCustomList,
			setRenderKey,
		} = this.props;
		const { showModal, componentProps: stateComponentProps, previewModal } = this.state;
		if (!componentProps.dataField) return null;

		const RSComponent = componentMap[component];
		let tutorialClass = '';
		let editTutorialClass = '';

		if (id === 'search') {
			tutorialClass = 'search-tutorial-1';
			editTutorialClass = 'search-tutorial-2';
		}
		if (id === 'result') {
			tutorialClass = 'search-tutorial-4';
			editTutorialClass = 'search-tutorial-5';
		}

		const showPreview = component === 'ReactiveList';
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
							className={componentStyles}
							{...getComponentProps({
								component, componentProps, mappings, setRenderKey,
							})}
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
						handlePreviewModal={this.handlePreviewModal}
						handleSavePreview={this.handleSavePreview}
						visible={previewModal}
						dataField={generateDataField(component, componentProps.dataField, mappings)}
					/>
				) : null}
			</div>
		);
	}
}

RSWrapper.defaultProps = {
	showDelete: true,
};

export default RSWrapper;
