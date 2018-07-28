import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Input,
	Switch,
	Button,
	Modal,
} from 'antd';
import Select from 'react-select';

import { DataSearch, MultiList } from '@appbaseio/reactivesearch';

import dataSearchTypes from '../utils/datasearch-types';
import multiListTypes from '../utils/multilist-types';

const componentMap = {
	DataSearch,
	MultiList,
};

const propsMap = {
	DataSearch: dataSearchTypes,
	MultiList: multiListTypes,
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
			props.onPropChange(props.id, { dataField: multiple ? [dataFields[0]] : dataFields[0] });
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
			return Object.keys(this.props.mappings)
				.filter(field => types.includes(this.props.mappings[field].type));
		}

		const fields = Object.keys(this.props.mappings)
			.filter((field) => {
				let fieldsToCheck = [
					this.props.mappings[field],
				];

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

	getSubFields = (field, types) => [
		...this.props.mappings[field].fields
			.filter(item => types.includes(this.props.mappings[field].originalFields[item].type))
			.map(item => `${field}.${item}`),
	];

	setError = (error) => {
		this.setState({
			error,
		}, () => {
			setTimeout(() => {
				this.setState({
					error: '',
				});
			}, 3000);
		});
	}

	// generates the dataField prop for reactivesearch component
	// based on the selected-field(s)
	generateDataField = (selectedFields) => {
		const { types, multiple } = propsMap[this.props.component].dataField;
		if (multiple) {
			let resultFields = [];
			selectedFields.forEach((item) => {
				resultFields = [
					item,
					...resultFields,
					...this.getSubFields(item, types),
				];
			});
			return resultFields;
		}

		const validFields = this.getSubFields(selectedFields, types);
		return validFields ? validFields[0] : null;
	}

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
		if (Array.isArray(item) && !item.length) {
			this.setError('DataField is a required prop');
		} else if (item) {
			const dataField = Array.isArray(item)
				? item.map(val => val.label)
				: item.label;

			this.setState({
				componentProps: {
					...this.state.componentProps,
					dataField,
				},
			});
		}
		// this.props.onChange(this.props.id, { dataField });
	};

	handleSwitchPropChange = (name, value) => {
		this.setState({
			componentProps: {
				...this.state.componentProps,
				[name]: value,
			},
		});
	}

	handlePropChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			componentProps: {
				...this.state.componentProps,
				[name]: value,
			},
		});
	};

	transformToSuggestion = item => ({
		label: item,
		value: item,
	});

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
			<Form.Item
				label={item.label}
				colon={false}
				key={name}
			>
				<div
					style={{ margin: '0 0 6px' }}
					className="ant-form-extra"
				>
					{item.description}
				</div>
				{FormInput}
			</Form.Item>
		);
	}

	renderPropsForm = () => {
		const propNames = propsMap[this.props.component];
		const { dataField } = this.state.componentProps;

		const { multiple } = propNames.dataField;
		const dataFieldDefault = multiple
			? dataField.map(this.transformToSuggestion)
			: dataField;

		const fields = this.getAvailableDataField();

		return (
			<Form onSubmit={this.handleSubmit}>
				<Form.Item
					label={propNames.dataField.label}
					colon={false}
				>
					<div
						style={{ margin: '0 0 6px' }}
						className="ant-form-extra"
					>
						{propNames.dataField.description}
					</div>
					{
						this.state.error
							? (
								<div
									style={{ color: 'tomato', margin: '0 0 6px' }}
									className="ant-form-extra"
								>
									{this.state.error}
								</div>
							)
							: null
					}
					<Select
						name="form-field-name"
						value={dataFieldDefault}
						onChange={this.handleDataFieldChange}
						options={fields.map(item => ({
							label: item,
							value: item,
						}))}
						multi={multiple}
					/>
				</Form.Item>
				{
					Object.keys(propNames)
					.filter(item => item !== 'dataField')
					.map(item => this.renderFormItem(propNames[item], item))
				}
			</Form>
		);
	}

	render() {
		if (!this.props.componentProps.dataField) return null;
		const RSComponent = componentMap[this.props.component];

		let btnStyle = {};
		if (this.props.full) {
			btnStyle = {
				width: '49%',
				marginTop: 10,
			};
		}

		return (
			<div>
				<Row gutter={8}>
					<Col span={this.props.full ? 24 : 22}>
						<RSComponent
							componentId={this.props.id}
							{...this.props.componentProps}
							dataField={this.generateDataField(this.props.componentProps.dataField)}
						/>
					</Col>
					<Col span={this.props.full ? 24 : 2}>
						<Button
							size="large"
							onClick={this.showModal}
							style={btnStyle}
						>
							Edit
						</Button>
						{
							this.props.full
								? (
									<Button
										size="large"
										type="danger"
										onClick={() => this.props.onDelete(this.props.id)}
										style={{
											...btnStyle,
											marginLeft: '2%',
										}}
									>
										Delete
									</Button>
								)
								: null
						}
					</Col>
				</Row>

				<Modal
					title={`Edit ${this.props.component} Props`}
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
