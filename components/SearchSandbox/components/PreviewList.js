import React from 'react';
import { Modal, Dropdown, Menu, Button, Icon, Card, Avatar, message } from 'antd';

import { ReactiveList } from '@appbaseio/reactivesearch';

const { Meta } = Card;

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
			</div>
		);
	};

	render() {
		const {
			title, image, url, description,
		} = this.state;
		let resultComponentProps = this.props.componentProps.result || {};
		resultComponentProps = {
			size: 5,
			pagination: true,
			sortBy: 'asc',
			paginationAt: 'bottom',
			...resultComponentProps,
			showResultStats: false,
			onAllData: results =>
				results.map(res => (
					<Card key={res._id}>
						<Meta
							avatar={<Avatar src={this.props.getNestedValue(res, image)} />}
							title={title ? this.props.getNestedValue(res, title) : 'NA'}
							description={
								description ? (
									<div className="ant-card-meta-description">
										{this.props.getNestedValue(res, description)}
										{url ? (
											<Button
												type="primary"
												size="small"
												href={url}
												target="_blank"
												style={{ marginTop: '12px', display: 'table' }}
											>
												Link
											</Button>
										) : null}
									</div>
								) : (
									'NA'
								)
							}
						/>
					</Card>
				)),
			react: {
				and: Object.keys(this.props.componentProps).filter(item => item !== 'result'),
			},
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
					{...resultComponentProps}
					dataField={this.props.dataField}
				/>
			</Modal>
		);
	}
}

export default PreviewList;
