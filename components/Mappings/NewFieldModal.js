import React, { Component } from 'react';
import { Tooltip, Icon, Menu, Dropdown, Modal, Input, Button } from 'antd';

import { Header, inputStyles, dropdown } from './styles';
import conversionMap from '../../utils/conversionMap';
import textUsecases from './usecases';

const fieldNameMessage = () => (
	<div style={{ maxWidth: 250 }}>
		Add a nested field by using the dot (.) notation, e.g. foo.bar will create a mapping like:
		<pre style={{ marginTop: 5, padding: 10, backgroundColor: '#eee' }}>
			{`foo: {
    bar: { ... }
}`}
		</pre>
	</div>
);

const usecaseMessage = () => (
	<div style={{ maxWidth: 250 }}>
		Based on the primary use case, whether search or aggregations, we will add the appropriate
		analyzers, mappings to ensure best results when performing the action
	</div>
);

export default class NewFieldModal extends Component {
	constructor(props) {
		super(props);

		this.usecases = textUsecases;
		this.input = React.createRef();
		this.state = this.getInitialState();
	}

	getInitialState = () => ({
		esType: this.props.types[0] || '',
		name: '',
		usecase: 'search',
		type: 'text',
		error: '',
	});

	handleEsTypeChange = label => {
		this.setState({ esType: label, fieldType: label });
	};

	handleNewFieldChange = e => {
		const { name, value } = e.target;
		this.setState({
			...this.state.new,
			[name]: value,
		});
	};

	addField = () => {
		const { esType, fieldType, name, usecase, type } = this.state;
		const deletedPaths = this.props.deletedPaths.map(item =>
			item.split('.properties.').join('.'),
		);
		const fieldName = `${fieldType || esType}.${name}`;

		if (name && deletedPaths.includes(fieldName)) {
			this.setState({
				error:
					"You're trying to add a field which you just deleted. This will result in loss of data.",
			});
		} else if (name) {
			this.props.addField({
				name: fieldName,
				type,
				usecase: type === 'text' ? usecase : null,
			});
			this.setState(() => this.getInitialState());
			this.props.onClose();
		} else {
			this.input.current.focus();
			this.setState({
				error: 'Please enter a valid field name',
			});
		}
	};

	handleDropdownMenu = (e, name) => {
		const { key } = e;
		this.setState({
			[name]: key,
		});
	};

	renderDropDown = ({ name, options, value }) => {
		const menu = (
			<Menu onClick={e => this.handleDropdownMenu(e, name)}>
				{options.map(option => (
					<Menu.Item key={option.value}>{option.label}</Menu.Item>
				))}
			</Menu>
		);
		return (
			<Dropdown overlay={menu}>
				<Button className={dropdown}>
					{value}
					<Icon type="down" />
				</Button>
			</Dropdown>
		);
	};

	render() {
		const { fieldType, esType } = this.state;
		const menu = (
			<Menu onClick={e => this.handleEsTypeChange(e.key)}>
				{this.props.types.map(item => (
					<Menu.Item key={item}>{item}</Menu.Item>
				))}
				{fieldType && !this.props.types.includes(fieldType) ? (
					<Menu.Item key={fieldType}>{`Create type ${fieldType}`}</Menu.Item>
				) : null}
			</Menu>
		);
		return (
			<Modal
				visible={this.props.show}
				onCancel={this.props.onClose}
				onOk={this.addField}
				title="Add new Field"
				width="100%"
				okText="Add Field"
				style={{
					maxWidth: '800px',
				}}
			>
				<section>
					<Header>
						{this.props.esVersion < 6 ? <span className="col">Type</span> : null}
						<span className="col col--grow">
							Field Name
							<Tooltip title={fieldNameMessage}>
								<span style={{ marginLeft: 5 }}>
									<Icon type="info-circle" />
								</span>
							</Tooltip>
						</span>
						{this.state.type === 'text' ? (
							<span className="col">
								Use case
								<Tooltip title={usecaseMessage}>
									<span style={{ marginLeft: 5 }}>
										<Icon type="info-circle" />
									</span>
								</Tooltip>
							</span>
						) : null}
						<span className="col">Data Type</span>
					</Header>
					<div style={{ padding: '10px 0', display: 'flex' }}>
						{this.props.esVersion < 6 ? (
							<span style={{ width: 150, marginRight: 12 }}>
								<Dropdown overlay={menu}>
									<Input
										type="text"
										name="fieldType"
										value={this.state.fieldType}
										placeholder="Select or Create Type"
										className={inputStyles}
										onChange={this.handleNewFieldChange}
									/>
								</Dropdown>
							</span>
						) : null}
						{/* <select
							className={dropdown}
							style={{ textTransform: 'none', marginLeft: 0, marginRight: 12 }}
							name="esType"
							defaultValue={this.props.types[0]}
							onChange={this.handleNewFieldChange}
						>
							{
								this.props.types.map(value => (
									<option key={value} value={value}>{value}</option>
								))
							}
						</select> */}
						<Input
							ref={this.input}
							type="text"
							name="name"
							autoComplete="off"
							placeholder="Enter field name"
							value={this.state.name}
							className={inputStyles}
							onChange={this.handleNewFieldChange}
						/>
						{this.state.type === 'text'
							? this.renderDropDown({
									name: 'usecase',
									options: Object.entries(this.usecases).map(entry => ({
										label: entry[1],
										value: entry[0],
									})),
									value: this.state.usecase,
							  })
							: null}
						{this.renderDropDown({
							name: 'type',
							options: Object.keys(conversionMap)
								.filter(value => value !== 'object')
								.map(entry => ({
									label: entry,
									value: entry,
								})),
							value: this.state.type,
						})}
					</div>
					{this.state.error ? (
						<p style={{ color: 'tomato' }}>{this.state.error}</p>
					) : null}
				</section>
			</Modal>
		);
	}
}
