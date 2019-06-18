import React, { Component } from 'react';
import {
 Row, Col, Form, Button, Modal, Popover, message,
} from 'antd';

import {
 DataSearch, MultiList, ReactiveList, CategorySearch,
} from '@appbaseio/reactivesearch';

import dataSearchTypes from '../utils/datasearch-types';
import multiListTypes from '../utils/multilist-types';
import reactiveListTypes from '../utils/reactivelist-types';
import categorySearchTypes from '../utils/categorysearch-types';
import { generateDataField, getAvailableDataField } from '../utils/dataField';
import constants from '../utils/constants';
import { getComponentCode } from '../template';
import PreviewList from './PreviewList';
import DataFieldInput from './DataFieldInput';
import { SandboxContext } from '../index';
import getComponentProps from '../utils/getComponentProps';
import {
 NumberInput, TextInput, DropdownInput, ToggleInput,
} from '../../shared/Input';
import { formWrapper } from '../styles';
import HtmlEditor from '../../../../components/HtmlEditor';

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
			previewModal: false,
		};

		if (!props.componentProps.dataField) {
			// set default dataField for the component if not defined
			const { component, id, mappings } = props;
			const dataFields = getAvailableDataField({ component, id, mappings });
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

	componentDidUpdate(prevProps) {
		const { componentProps: prevComponentProps } = prevProps;
		const { componentProps } = this.props;
		if (componentProps !== prevComponentProps) {
			// eslint-disable-next-line
			this.setState({
				componentProps,
			});
		}
	}

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
		const newComponentProps = { ...componentProps, ...newProps };
		this.setState({
			componentProps: newComponentProps,
		});
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

	renderFormItem = (item, name) => {
		const { componentProps, isShopify } = this.props;
		let FormInput = null;
		const value = componentProps[name] === undefined ? item.default : componentProps[name];
		const placeholder = item.placeholder || '';

		if(name === 'customSuggestions' && !isShopify) {
			return null;
		}

		switch (item.input) {
			case 'bool': {
				FormInput = (
					<ToggleInput value={value} name={name} handleChange={this.setComponentProps} />
				);
				break;
			}
			case 'number': {
				FormInput = (
					<NumberInput
						name={name}
						value={Number(value)}
						min={item.min}
						max={item.max}
						handleChange={this.setComponentProps}
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
				} = this.props; // prettier-ignore
				const { componentProps: stateComponentProps } = this.state;

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

			case 'editor': {
				const {componentProps: stateComponentProps} = this.state;
				FormInput = (
					<HtmlEditor name={name} height="250px" width="100%" value={stateComponentProps.customSuggestions || value || undefined} placeholder={placeholder} onChange={(value) => this.setComponentProps({[name]: value})} />
				)
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
		const { componentProps: stateComponentProps } = this.state;
		const { component, id, mappings } = this.props;
		const propNames = propsMap[component];

		return (
			<Form onSubmit={this.handleSubmit} className={formWrapper}>
				<DataFieldInput
					label={propNames.dataField.label}
					id={id}
					description={propNames.dataField.description}
					componentProps={stateComponentProps}
					getAvailableDataField={() => getAvailableDataField({ component, id, mappings })}
					setComponentProps={this.setComponentProps}
				/>
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
							{...getComponentProps({
								component,
								componentProps,
								mappings,
								setRenderKey,
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
