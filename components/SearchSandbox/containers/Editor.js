import React, { Component } from 'react';
import { Row, Col, Card, Button, Modal, Form, Input, Switch } from 'antd';
import { ReactiveBase, ReactiveList, SelectedFilters } from '@appbaseio/reactivesearch';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import multiListTypes from '../utils/multilist-types';
import RSWrapper from '../components/RSWrapper';
import { SCALR_API } from '../../../utils';

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

	transformToSuggestion = item => ({
		label: item,
		value: item,
	});

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
	}

	handleOk = () => {
		// only set to store if dataField is valid
		this.props.onPropChange(
			`list-${this.props.filterCount + 1}`,
			this.state.listComponentProps,
		);
		this.props.setFilterCount(this.props.filterCount + 1);
		this.setState({
			showModal: false,
		}, this.resetNewComponentData);
	};

	handleCancel = () => {
		this.setState({
			showModal: false,
		}, this.resetNewComponentData);
	};

	handleDataFieldChange = (item) => {
		const dataField = item.label;

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
	}

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
		const { dataField } = this.state.listComponentProps;
		if (!dataField.length) {
			return (
				<p>
					There are no compatible fields present in your data
					mappings. <a href="/mappings">You can edit your mappings here</a> to
					add filters (agggregation components).
				</p>
			);
		}
		const fields = this.getAvailableDataField();

		return (
			<Form onSubmit={this.handleSubmit}>
				<Form.Item
					label={multiListTypes.dataField.label}
					colon={false}
				>
					<div
						style={{ margin: '0 0 6px' }}
						className="ant-form-extra"
					>
						{multiListTypes.dataField.description}
					</div>
					<Select
						name="form-field-name"
						value={dataField}
						onChange={this.handleDataFieldChange}
						options={fields.map(item => ({
							label: item,
							value: item,
						}))}
						clearable={false}
					/>
				</Form.Item>
				{
					Object.keys(multiListTypes)
					.filter(item => item !== 'dataField')
					.map(item => this.renderFormItem(multiListTypes[item], item))
				}
			</Form>
		);
	}

	render() {
		return (
			<ReactiveBase
				app={this.props.appName}
				credentials={this.props.credentials}
				url={SCALR_API}
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
						{
							Object.keys(this.props.componentProps)
								.filter(item => item !== 'search')
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
								))
						}
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
							<ReactiveList
								componentId="result"
								dataField={this.getAvailableDataField()[0]}
								onData={res => <div>{res.original_title}</div>}
								react={{
									and: Object.keys(this.props.componentProps),
								}}
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
