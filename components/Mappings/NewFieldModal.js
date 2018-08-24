import React, { Component } from 'react';
import { Tooltip, Icon, Menu, Dropdown } from 'antd';

import Modal from '../shared/Modal';
import { Header, Input, Button, dropdown } from './styles';
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
		const { esType, name, usecase, type } = this.state;
		const deletedPaths = this.props.deletedPaths.map(item =>
			item.split('.properties.').join('.'),
		);
		const fieldName = `${esType}.${name}`;

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

	render() {
		const { fieldType, esType } = this.state;
		const menu = (
			<Menu onClick={e => this.handleEsTypeChange(e.key)}>
				{this.props.types.map(item => <Menu.Item key={item}>{item}</Menu.Item>)}
				{fieldType && !this.props.types.includes(fieldType) ? (
					<Menu.Item key={fieldType}>{`Create type ${fieldType}`}</Menu.Item>
				) : null}
			</Menu>
		);
		return (
			<Modal show={this.props.show} onClose={this.props.onClose}>
				<h3>Add New Field</h3>

				<section>
					<Header>
						<span className="col">Type</span>
						<span className="col col--grow">
							Field Name
							<Tooltip title={fieldNameMessage}>
								<span>
									<Icon type="info-circle" />
								</span>
							</Tooltip>
						</span>
						{this.state.type === 'text' ? (
							<span className="col">
								Use case
								<Tooltip title={usecaseMessage}>
									<span>
										<Icon type="info-circle" />
									</span>
								</Tooltip>
							</span>
						) : null}
						<span className="col">Data Type</span>
					</Header>
					<div style={{ padding: '10px 0', display: 'flex' }}>
						<span style={{ width: 150, marginRight: 12 }}>
							<Dropdown overlay={menu}>
								<Input
									type="text"
									name="fieldType"
									value={this.state.fieldType}
									placeholder="Select or Create Type"
									defaultValue={this.state.esType}
									onChange={this.handleNewFieldChange}
								/>
							</Dropdown>
						</span>
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
							placeholder="Enter field name"
							value={this.state.name}
							onChange={this.handleNewFieldChange}
						/>
						{this.state.type === 'text' ? (
							<select
								className={dropdown}
								name="usecase"
								defaultValue={this.state.usecase}
								onChange={this.handleNewFieldChange}
							>
								{Object.entries(this.usecases).map(value => (
									<option key={value[0]} value={value[0]}>
										{value[1]}
									</option>
								))}
							</select>
						) : null}
						<select
							className={dropdown}
							name="type"
							defaultValue={this.state.type}
							onChange={this.handleNewFieldChange}
						>
							{Object.keys(conversionMap)
								.filter(value => value !== 'object')
								.map(value => (
									<option key={value} value={value}>
										{value.split('_').join(' ')}
									</option>
								))}
						</select>
					</div>
					{this.state.error ? (
						<p style={{ color: 'tomato' }}>{this.state.error}</p>
					) : null}
					<div
						style={{ display: 'flex', flexDirection: 'row-reverse', margin: '10px 0' }}
					>
						<Button onClick={this.addField}>Add Field</Button>
					</div>
				</section>
			</Modal>
		);
	}
}
