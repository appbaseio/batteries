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
	notification,
	Popconfirm,
} from 'antd';
import { ReactiveBase, SelectedFilters } from '@appbaseio/reactivesearch';
import ExpandCollapse from 'react-expand-collapse';
import PropTypes from 'prop-types';

import Appbase from 'appbase-js';

import Ace from './AceEditor';
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
			editorValue: '',
			isValidJSON: true,
			editorObjectId: '',
			renderKey: Date.now(),
			showVideo: false,
			isEditable: false,
		};

		this.appbaseRef = Appbase({
			app: this.props.appName,
			url: this.props.url,
			credentials: this.props.credentials,
		});
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
			() => setTimeout(
					() => this.setState({
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

	handleVideoModal = () => {
		this.setState({
			showVideo: !this.state.showVideo,
		});
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

	handleUpdateJSON = (updatedJSONString) => {
		const updatedJSON = JSON.parse(updatedJSONString);
		let responseMessage = {
			message: 'Edit successfully saved',
			description: 'The desired result data was successfully updated.',
			duration: 4,
		};
		this.appbaseRef
			.update({
				type: this.props.mappingsType,
				id: this.state.editorObjectId,
				body: {
					doc: updatedJSON,
				},
			})
			.then((res) => {
				this.setState({
					isEditable: false,
					renderKey: res._timestamp, // eslint-disable-line
				});
				notification.open(responseMessage);
			})
			.catch(() => {
				responseMessage = {
					message: 'Update JSON',
					description: 'There were error in Updating JSON. Try again Later.',
					duration: 2,
				};
				notification.open(responseMessage);
			});
	};

	handleDeleteJSON = (id) => {
		let responseMessage = {
			message: 'Delete JSON',
			description: 'You have successfully deleted JSON.',
			duration: 4,
		};
		this.appbaseRef
			.delete({
				type: this.props.mappingsType,
				id,
			})
			.then((res) => {
				this.setState({
					renderKey: res._timestamp,
				});
				notification.open(responseMessage);
			})
			.catch(() => {
				responseMessage = {
					message: 'Delete JSON',
					description: 'There were error in Deleting JSON. Try again Later.',
					duration: 2,
				};
				notification.open(responseMessage);
			});
	};

	handleEditing = () => {
		this.setState({
			isEditable: !this.state.isEditable,
		});
	};

	handleEditingJSON = (value) => {
		let isValidJSON = true;
		try {
			JSON.parse(value);
		} catch (e) {
			isValidJSON = false;
		}
		this.setState({
			editorValue: value,
			isValidJSON,
		});
	};

	handleInitialEditorValue = (res) => {
		const { _id: id, _index: del, ...objectJSON } = res;

		const stringifiedJSON = JSON.stringify(objectJSON, null, '\t');

		this.setState({
			editorObjectId: id,
			editorValue: stringifiedJSON,
		});
	};

	resetEditorValues = () => {
		this.setState({
			editorObjectId: '',
			editorValue: '',
			isEditable: false,
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
					There are no compatible fields present in your data mappings.{' '}
					<a href={this.props.mappingsURL}>You can edit your mappings</a> to add filters
					(agggregation components).
				</p>
			);
		}

		const { dataField } = this.state.listComponentProps;
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

	renderAsTree = (res, key = '0') => {
		if (!res) return null;
		const iterable = Array.isArray(res) ? res : Object.keys(res);
		return iterable.map((item, index) => {
			const type = typeof res[item];
			if (type === 'string' || type === 'number') {
				return (
					<TreeNode
						title={(
<div>
								<span>{item}:</span>
								&nbsp;
								<span dangerouslySetInnerHTML={{ __html: res[item] }} />
</div>
)}
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

	renderDeleteJSON = res => (
		<Popconfirm
			title="Are you sure you want to delete this JSON?"
			placement="bottomRight"
			onConfirm={() => this.handleDeleteJSON(res._id)}
			okText="Yes"
		>
			<Button shape="circle" icon="delete" style={{ marginRight: '5px' }} />
		</Popconfirm>
	);

	renderJSONEditor = res => (
		<Popover
			placement="leftTop"
			trigger="click"
			onVisibleChange={visible => (visible ? this.handleInitialEditorValue(res) : this.resetEditorValues())
			}
			content={
				this.state.isEditable ? (
					<Ace
						mode="json"
						value={this.state.editorValue}
						onChange={value => this.handleEditingJSON(value)}
						theme="monokai"
						name="editor-JSON"
						fontSize={14}
						showPrintMargin
						style={{ maxHeight: '250px' }}
						showGutter
						highlightActiveLine
						setOptions={{
							showLineNumbers: true,
							tabSize: 2,
						}}
						editorProps={{ $blockScrolling: true }}
					/>
				) : (
					<pre style={{ width: 300 }}>{JSON.stringify(res, null, 4)}</pre>
				)
			}
			title={(
<Row>
					<Col span={this.state.isEditable ? 19 : 18}>
						<h5 style={{ display: 'inline-block' }}>
							{this.state.isEditable ? 'Edit JSON' : 'JSON Result'}
						</h5>
					</Col>
					<Col span={this.state.isEditable ? 5 : 6}>
						<Tooltip visible={this.state.copied} title="Copied">
							<Button
								shape="circle"
								icon="copy"
								size="small"
								onClick={() => this.copyJSON(res)}
							/>
						</Tooltip>
						{this.state.isEditable ? (
							<Button
								size="small"
								type="primary"
								style={{ marginLeft: '5px' }}
								disabled={!this.state.isValidJSON}
								onClick={() => this.handleUpdateJSON(this.state.editorValue)}
							>
								Update
							</Button>
						) : (
							<Button
								size="small"
								type="primary"
								style={{ marginLeft: '5px' }}
								disabled={!this.state.isValidJSON}
								onClick={() => this.handleEditing()}
							>
								Edit
							</Button>
						)}
					</Col>
</Row>
)}
		>
			<Button shape="circle" icon="file-text" style={{ marginRight: '5px' }} />
		</Popover>
	);

	render() {
		let resultComponentProps = this.props.componentProps.result || {};
		resultComponentProps = {
			size: 5,
			pagination: true,
			sortBy: 'asc',
			paginationAt: 'bottom',
			...resultComponentProps,
			onData: (res) => {
				const { _id, _index, ...renderedJSON } = res;
				return (
					<div className={listItem} key={res._id}>
						<ExpandCollapse previewHeight="390px" expandText="Show more">
							{<Tree showLine>{this.renderAsTree(renderedJSON)}</Tree>}
						</ExpandCollapse>
						<div style={{ marginTop: 10, textAlign: 'right' }}>
							{this.renderJSONEditor(res)}
							{this.renderDeleteJSON(res)}
						</div>
					</div>
				);
			},
			react: {
				and: Object.keys(this.props.componentProps).filter(item => item !== 'result'),
			},
		};

		const title = (
			<span>
				Search Preview{' '}
				<Button style={{ float: 'right' }} onClick={this.handleVideoModal} size="small">
					Watch Video
				</Button>
			</span>
		);
		return (
			<ReactiveBase
				app={this.props.appName}
				credentials={this.props.credentials}
				url={this.props.url}
			>
				<Row gutter={16} style={{ padding: 20 }}>
					<Col span={6}>
						<Card title={title}>
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
										customProps={this.props.customProps}
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
								customProps={this.props.customProps}
								componentProps={this.props.componentProps.search || {}}
								onPropChange={this.props.onPropChange}
							/>
						</Card>

						<Card>
							<SelectedFilters />
							<RSWrapper
								id="result"
								component="ReactiveList"
								key={this.state.renderKey}
								mappings={this.props.mappings}
								customProps={this.props.customProps}
								mappingsType={this.props.mappingsType}
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
						okText="Add"
						destroyOnClose
					>
						{this.renderPropsForm()}
					</Modal>
					<Modal
						title="Search Preview: 1 min walkthrough"
						visible={this.state.showVideo}
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
	mappingsURL: PropTypes.string.isRequired,
};

Editor.defaultProps = {
	mappingsURL: '/mappings',
};
