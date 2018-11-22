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
	message,
} from 'antd';
import { ReactiveBase, SelectedFilters } from '@appbaseio/reactivesearch';
import PropTypes from 'prop-types';

import multiListTypes from '../utils/multilist-types';
import RSWrapper from '../components/RSWrapper';
import { formWrapper } from '../styles';

export default class Editor extends Component {
	constructor(props) {
		super(props);

		const dataFields = this.getAvailableDataField();
		this.state = {
			showModal: false,
			listComponentProps: {
				dataField: dataFields.length ? dataFields[0] : '',
			},
			renderKey: Date.now(),
			showVideo: false,
		};
	}

	getAvailableDataField = () => {
		const { types } = multiListTypes.dataField;
		const { mappings } = this.props;

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
			const { filterCount, setFilterCount, onPropChange } = this.props;
			const { listComponentProps } = this.state;
			onPropChange(
				`list-${filterCount + 1}`,
				listComponentProps,
			);
			setFilterCount(filterCount + 1);
			this.setState(
				{
					showModal: false,
				},
				this.resetNewComponentData,
			);
			message.success('New filter added');
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

	handleVideoModal = () => {
		this.setState(({ showVideo }) => ({
			showVideo: !showVideo,
		}));
	};

	handleDataFieldChange = (item) => {
		const dataField = item.key;
		const { listComponentProps } = this.state;
		this.setState({
			listComponentProps: {
				...listComponentProps,
				dataField,
			},
		});
	};

	handleSwitchPropChange = (name, value) => {
	const { listComponentProps } = this.state;
		this.setState({
			listComponentProps: {
				...listComponentProps,
				[name]: value,
			},
		});
	};

	handlePropChange = (e) => {
		const { name, value, type } = e.target;
		const { listComponentProps } = this.state;
		this.setState({
			listComponentProps: {
				...listComponentProps,
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
		const { mappingsURL } = this.props;
		if (!fields.length) {
			return (
				<p>
					There are no compatible fields present in your data mappings.{' '}
					<a href={mappingsURL}>You can edit your mappings</a> to add filters
					(agggregation components).
				</p>
			);
		}

		const { listComponentProps: { dataField } } = this.state;
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

	setRenderKey = (newKey) => {
		this.setState({
			renderKey: newKey,
		});
	}

	render() {
		const {
			componentProps,
			appName,
			credentials,
			url,
		} = this.props;
		const {
			renderKey, showModal, showVideo,
		} = this.state;
		const title = (
			<span>
				Search Preview{' '}
				{
					window.innerWidth > 1280
					? <Button style={{ float: 'right' }} onClick={this.handleVideoModal} size="small">
						Watch Video
					</Button> : null
				}
			</span>
		);
		return (
			<ReactiveBase
				app={appName}
				credentials={credentials}
				url={url}
				analytics
			>
				<Row gutter={16} style={{ padding: 20 }}>
					<Col span={6}>
						<Card title={title} id="video-title">
							<Button
								style={{ width: '100%' }}
								size="large"
								icon="plus-circle-o"
								className="search-tutorial-3"
								onClick={this.showModal}
							>
								Add New Filter
							</Button>
						</Card>
						{Object.keys(componentProps)
							.filter(item => item !== 'search' && item !== 'result')
							.map(config => (
								<Card key={config} style={{ marginTop: 20 }}>
									<RSWrapper
										id={config}
										component="MultiList"
										componentProps={componentProps[config] || {}}
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
								component={
									this.props.useCategorySearch ? 'CategorySearch' : 'DataSearch'
								}
								componentProps={componentProps.search || {}}
							/>
						</Card>

						<Card>
							<SelectedFilters />
							<RSWrapper
								id="result"
								component="ReactiveList"
								key={renderKey}
								componentProps={
									componentProps.result ? {
											...componentProps.result,
											react: {
												and: Object.keys(componentProps).filter(item => item !== 'result'),
											},
										} : {}
									}
								setRenderKey={this.setRenderKey}
								full
								showDelete={false}
							/>
						</Card>
					</Col>

					<Modal
						title="Add New Filter"
						visible={showModal}
						onOk={this.handleOk}
						onCancel={this.handleCancel}
						okText="Add"
						destroyOnClose
					>
						{this.renderPropsForm()}
					</Modal>
					<Modal
						title="Search Preview: 1 min walkthrough"
						visible={showVideo}
						onOk={this.handleVideoModal}
						onCancel={this.handleVideoModal}
						destroyOnClose
					>
						<iframe
							width="460"
							height="240"
							src="https://www.youtube.com/embed/f5SHz80r9Ro"
							frameBorder="0"
							title="Dejavu"
							allow="autoplay; encrypted-media"
							allowFullScreen
						/>
					</Modal>
				</Row>
			</ReactiveBase>
		);
	}
}

Editor.propTypes = {
	mappingsURL: PropTypes.string,
};

Editor.defaultProps = {
	mappingsURL: '/mappings',
};
