import React from 'react';
import {
 Modal, Dropdown, Menu, Button, Icon, message, Row, Col,
} from 'antd';
import { ReactiveList } from '@appbaseio/reactivesearch';

import getNestedValue from '../utils';

class PreviewList extends React.Component {
	constructor() {
		super();
		this.state = {
			title: '',
			description: '',
			image: '',
			url: '',
		};

		this.options = ['title', 'description', 'image', 'url'];
	}

	componentWillReceiveProps(props) {
		if (props.componentProps.metaFields) {
			const {
				url, title, description, image,
			} = props.componentProps.metaFields;
			this.setState({
				url,
				image,
				description,
				title,
			});
		}
	}

	handleMenuClick = (e, name) => {
		this.setState({
			[name]: e.key,
		});
	};

	handleSave = () => {
		const values = {};
		this.options.forEach(option => values[option] = this.state[option]);

		if (!this.state.description || !this.state.title) {
			message.error('Please select title and description fields');
		}
		this.props.handleSavePreview(values);
	}

	resetSelectedOption = (optionName) => {
		const name = optionName;
		this.setState({
			[name]: '',
		});
	}

	renderDropdown = (name) => {
		const options = this.options.filter(option => option !== name);
		const usedValue = [];
		options.forEach(value => usedValue.push(this.state[value]));

		const menuOption = this.props.options.filter(option => !usedValue.includes(option));

		const menu = (
			<Menu onClick={e => this.handleMenuClick(e, name)}>
				{menuOption.map(option => <Menu.Item key={option}>{option}</Menu.Item>)}
			</Menu>
		);

		const style = {
			margin: '8px 0',
		};

		return (
			<div style={{ margin: '16px 0px' }}>
				<label title={name} style={{ display: 'flex' }}>
					Select {name} field
				</label>
				<Dropdown overlay={menu} trigger={['click']}>
					<Button style={style}>
						{this.state[name] || 'Choose Option'} <Icon type="down" />
					</Button>
				</Dropdown>
				{this.state[name] ? <Button icon="undo" style={{ marginLeft: '10px' }} shape="circle" onClick={() => this.resetSelectedOption(name)} /> : null}
			</div>
		);
	};

	render() {
		const {
			title, image, url, description,
		} = this.state;
		let resultComponentProps = this.props.componentProps.result || {};
		resultComponentProps = {
			...resultComponentProps,
			onData: res => (
			<Row type="flex" gutter={16} key={res._id}>
				<Col span={getNestedValue(res, image) ? 6 : 0}>
					<img src={getNestedValue(res, image)} alt={getNestedValue(res, title) || 'Choose a valid Title Field for alt'} />
				</Col>
				<Col span={getNestedValue(res, image) ? 18 : 24}>
					<h3 style={{ fontWeight: '600' }}>{getNestedValue(res, title) || 'Choose a valid Title Field'}</h3>
					<p style={{ fontSize: '1em' }}>{getNestedValue(res, description) || 'Choose a valid description field'}</p>
				</Col>
			</Row>
			),
		};
		return (
			<Modal
				visible={this.props.visible}
				onOk={this.handleSave}
				okText="Save"
				onCancel={this.props.handlePreviewModal}
				title="Customize List Preview"
			>
				{this.options.map(option => this.renderDropdown(option))}
				<ReactiveList
					componentId={this.props.componentId}
					pagination
					paginationAt="bottom"
					{...resultComponentProps}
					dataField={this.props.dataField}
				/>
			</Modal>
		);
	}
}

export default PreviewList;
