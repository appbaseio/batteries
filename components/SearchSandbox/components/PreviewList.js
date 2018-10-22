import React from 'react';
import {
 Modal, Dropdown, Menu, Button, Icon, message, Row, Col, Switch, Card,
} from 'antd';
import { ReactiveList } from '@appbaseio/reactivesearch';

import getNestedValue from '../utils';

const { Meta } = Card;

class PreviewList extends React.Component {
	constructor(props) {
		super(props);
		if (props.componentProps.metaFields) {
			const {
				url,
				title,
				description,
				listLayout,
				image, // prettier-ignore
			} = props.componentProps.metaFields;
			this.state = {
				url,
				title,
				description,
				image,
				listLayout,
			};
		} else {
			this.state = {
				title: '',
				description: '',
				image: '',
				url: '',
				listLayout: true,
			};
		}
		this.options = ['title', 'description', 'image', 'url'];
	}

	handleMenuClick = (e, name) => {
		this.setState({
			[name]: e.key,
		});
	};

	handleSave = () => {
		const values = {};
		this.options.forEach(option => (values[option] = this.state[option]));

		if (!this.state.description || !this.state.title) {
			message.error('Please select title and description fields');
		}
		this.props.handleSavePreview(values, this.state.listLayout);
	};

	handleLayout = (val) => {
		this.setState({
			listLayout: val,
		});
	};

	resetSelectedOption = (optionName) => {
		const name = optionName;
		this.setState({
			[name]: '',
		});
	};

	renderDropdown = (name) => {
		const options = this.options.filter(option => option !== name);
		const usedValue = [];
		options.forEach(value => usedValue.push(this.state[value]));

		const menuOption = this.props.options.filter(option => !usedValue.includes(option));

		const menu = (
			<Menu
				onClick={e => this.handleMenuClick(e, name)}
				style={{ maxHeight: '250px', overflowY: 'scroll' }}
			>
				{menuOption.map(option => (
					<Menu.Item key={option}>{option}</Menu.Item>
				))}
			</Menu>
		);

		const style = {
			margin: '8px 0',
		};

		return (
			<div style={{ margin: '16px 0px' }} key={name}>
				<label title={name} style={{ display: 'flex' }}>
					Select {name} field
				</label>
				<Dropdown overlay={menu} trigger={['click']}>
					<Button style={style}>
						{this.state[name] || 'Choose Option'} <Icon type="down" />
					</Button>
				</Dropdown>
				{this.state[name] ? (
					<Button
						icon="undo"
						style={{ marginLeft: '10px' }}
						shape="circle"
						onClick={() => this.resetSelectedOption(name)}
					/>
				) : null}
			</div>
		);
	};

	render() {
		const {
			title: titleKey,
			image: imageKey,
			url: urlKey,
			description: descriptionKey,
		} = this.state;
		let resultComponentProps = this.props.componentProps.result || {};
		resultComponentProps = {
			...resultComponentProps,
			onData: (res) => {
				const url = getNestedValue(res, urlKey);
				const title = getNestedValue(res, titleKey) || 'Choose a valid title field';
				const description =					getNestedValue(res, descriptionKey) || 'Choose a valid description field';
				const image = getNestedValue(res, imageKey);
				const { listLayout } = this.state;
				return listLayout ? (
					<Row
						type="flex"
						gutter={16}
						key={res._id}
						style={{
							margin: '20px auto',
							padding: '5px',
							borderBottom: '1px solid #ededed',
						}}
					>
						<Col span={image ? 6 : 0}>
							<img
								style={{ width: '100%' }}
								src={image}
								alt={title || 'Choose a valid Title Field for alt'}
							/>
						</Col>
						<Col span={image ? 18 : 24}>
							<h3 style={{ fontWeight: '600' }}>{title}</h3>
							<p style={{ fontSize: '1em' }}>{description}</p>
							{url ? (
								<Button href={url} target="_blank" icon="link" shape="circle" />
							) : null}
						</Col>
					</Row>
				) : (
					<Row key={res._id} style={{ margin: '10px 10px 0 0', display: 'inline-flex' }}>
						<Card
							hoverable
							style={{ width: 240 }}
							cover={image && <img alt={title} src={image} />}
						>
							<Meta
								title={title}
								description={description}
								style={{ height: '100px', overflow: 'hidden' }}
							/>
						</Card>
					</Row>
				);
			},
		};
		const headingStyle = {
			margin: '25px 0 10px 0',
			fontWeight: '600',
		};

		return (
			<Modal
				visible={this.props.visible}
				onOk={this.handleSave}
				okText="Save"
				onCancel={this.props.handlePreviewModal}
				title="Customize List Preview"
			>
				<label title="layout" style={{ display: 'flex' }}>
					<h3 style={headingStyle}>{this.state.listLayout ? 'List' : 'Card'} Layout</h3>
				</label>
				<Switch
					checked={this.state.listLayout}
					onChange={val => this.handleLayout(val)}
					checkedChildren={<Icon type="bars" />}
					unCheckedChildren={<Icon type="appstore" />}
				/>
				<h3 style={headingStyle}>Choose fields</h3>
				{this.options.map(option => this.renderDropdown(option))}
				<ReactiveList
					componentId={this.props.componentId}
					pagination
					showResultStats={false}
					paginationAt="bottom"
					size={this.props.componentProps.size || 2}
					{...resultComponentProps}
					dataField={this.props.dataField}
				/>
			</Modal>
		);
	}
}

export default PreviewList;
