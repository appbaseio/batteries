import React from 'react';
import {
	Modal,
	Dropdown,
	Menu,
	Button,
	Icon,
	message,
	Row,
	Col,
	Typography,
	Tree,
	Switch,
	Tag,
} from 'antd';
import { css } from 'emotion';
import { ReactiveList } from '@appbaseio/reactivesearch';

import getNestedValue from '../utils';

const { Paragraph } = Typography;
const { TreeNode } = Tree;

const resultStyle = css`
	.pagination,
	.poweredBy {
		display: none;
	}
`;

class PreviewList extends React.Component {
	constructor(props) {
		super(props);
		if (props.componentProps.metaFields) {
			const { url, title, description, showRest, image } = props.componentProps.metaFields;
			this.state = {
				url,
				title,
				description,
				image,
				showRest: showRest || false,
			};
		} else {
			this.state = {
				title: '',
				description: '',
				image: '',
				url: '',
				showRest: false,
			};
		}
		this.options = ['title', 'description', 'image', 'url', 'showRest'];
		this.optional = ['image', 'url'];
	}

	handleMenuClick = (e, name) => {
		this.setState({
			[name]: e.key,
		});
	};

	renderAsTree = (res, key = '0') => {
		if (!res) return null;
		const iterable = Array.isArray(res) ? res : Object.keys(res);
		return iterable.map((item, index) => {
			const type = typeof res[item];
			if (type === 'string' || type === 'number') {
				const title = (
					<div>
						<span>{item}:</span>
						&nbsp;
						<span dangerouslySetInnerHTML={{ __html: res[item] }} />
					</div>
				);
				return <TreeNode title={title} key={`${key}-${index + 1}`} />;
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

	handleSave = () => {
		const values = {};
		this.options.forEach(option => (values[option] = this.state[option]));

		if (!this.state.description || !this.state.title) {
			message.error('Please select title and description fields');
		}
		this.props.handleSavePreview(values);
	};

	resetSelectedOption = optionName => {
		const name = optionName;
		this.setState({
			[name]: '',
		});
	};

	renderDropdown = name => {
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
				<Paragraph strong>
					Select {name} {this.optional.includes(name) ? <Tag>Optional</Tag> : ''}
				</Paragraph>
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

	handleSwitch = checked => {
		this.setState({
			showRest: checked,
		});
	};

	render() {
		const {
			title: titleKey,
			image: imageKey,
			url: urlKey,
			description: descriptionKey,
			showRest,
		} = this.state;
		let resultComponentProps = this.props.componentProps.result || {};
		resultComponentProps = {
			...resultComponentProps,
			renderItem: res => {
				const url = getNestedValue(res, urlKey);
				const title = getNestedValue(res, titleKey);
				const description = getNestedValue(res, descriptionKey);
				const image = getNestedValue(res, imageKey);
				return (
					<Row type="flex" gutter={16} key={res._id} className={resultStyle}>
						<Col span={image ? 6 : 0}>
							<img src={image} alt={title || 'Choose a valid Title Field for alt'} />
						</Col>
						<Col span={image ? 18 : 24}>
							<h3 style={{ fontWeight: '600' }}>
								{title || 'Choose a valid Title Field'}
							</h3>
							<p style={{ fontSize: '1em' }}>
								{description || 'Choose a valid description field'}
							</p>
						</Col>
						{showRest && (
							<Col
								style={{
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}
								span={24}
							>
								<Tree showLine>{this.renderAsTree(res)}</Tree>
							</Col>
						)}
					</Row>
				);
			},
		};

		return (
			<Modal
				visible={this.props.visible}
				onOk={this.handleSave}
				okText="Save"
				width={720}
				onCancel={this.props.handlePreviewModal}
				title="Set Result View"
			>
				<Row gutter={16} align="middle">
					<Col md={8} span={24}>
						{this.options
							.filter(i => i !== 'showRest')
							.map(option => this.renderDropdown(option))}
						<Paragraph strong>Show Remaining Fields</Paragraph>
						<Switch checked={showRest} onChange={this.handleSwitch} />
					</Col>
					<Col md={16} span={24}>
						<ReactiveList
							showResultStats={false}
							{...resultComponentProps}
							size={1}
							pagination
							className={resultStyle}
							innerClass={{
								pagination: 'pagination',
								poweredBy: 'poweredBy',
							}}
							showLoader
							componentId="preview-list"
							dataField={this.props.dataField}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}

export default PreviewList;
