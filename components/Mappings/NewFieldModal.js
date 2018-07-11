import React, { Component } from 'react';
import Modal from '../shared/Modal';
import { Header, Input, Button, dropdown } from './styles';
import conversionMap from '../../utils/conversionMap';
import textUsecases from './usecases';

export default class NewFieldModal extends Component {
	constructor(props) {
		super(props);

		this.usecases = textUsecases;
		this.state = this.getInitialState();
	}

	getInitialState = () => ({
		name: '',
		usecase: 'none',
		type: 'text',
		error: '',
	});

	handleNewFieldChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			...this.state.new,
			[name]: value,
		});
	}

	addField = () => {
		const { name, usecase, type } = this.state;
		const deletedPaths = this.props.deletedPaths
			.map(item => item.split('.properties.').join('.'));
		if (name && deletedPaths.includes(name)) {
			this.setState({
				error: 'You\'re trying to add a field which you just deleted. This will result in loss of data.',
			});
		} else if (name) {
			this.props.addField({
				name,
				type,
				usecase: type === 'text' ? usecase : null,
			});
			this.setState(() => this.getInitialState());
			this.props.onClose();
		} else {
			this.input.focus();
			this.setState({
				error: 'Please enter a valid field name',
			});
		}
	}

	render() {
		return (
			<Modal show={this.props.show} onClose={this.props.onClose}>
				<h3>Add New Field</h3>
				<p />

				<section>
					<Header>
						<span>Field Name</span>
						<div>
							{
								this.state.type === 'text'
									? (
										<span className="col">
											Use-case
										</span>
									)
									: null
							}
							<span className="col">
								Data Type
							</span>
						</div>
					</Header>
					<div style={{ padding: '10px 0', display: 'flex' }}>
						<Input
							innerRef={(el) => { this.input = el; }}
							type="text"
							name="name"
							placeholder="Enter field name"
							value={this.state.name}
							onChange={this.handleNewFieldChange}
						/>
						{
								this.state.type === 'text'
									? (
										<select
											className={dropdown}
											name="usecase"
											defaultValue={this.state.usecase}
											onChange={this.handleNewFieldChange}
										>
											{
												Object.entries(this.usecases).map(value => (
													<option key={value[0]} value={value[0]}>{value[1]}</option>
												))
											}
										</select>
									)
									: null
							}
						<select
							className={dropdown}
							name="type"
							defaultValue={this.state.type}
							onChange={this.handleNewFieldChange}
						>
							{
								Object.keys(conversionMap)
									.filter(value => value !== 'object')
									.map(value => (
										<option key={value} value={value}>{value.split('_').join(' ')}</option>
									))
							}
						</select>
					</div>
					{
						this.state.error
							? <p style={{ color: 'tomato' }}>{this.state.error}</p>
							: null
					}
					<div style={{ display: 'flex', flexDirection: 'row-reverse', margin: '10px 0' }}>
						<Button onClick={this.addField}>
							Add Field
						</Button>
					</div>
				</section>
			</Modal>
		);
	}
}
