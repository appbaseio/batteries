import React from 'react';
import {
 Input, Menu, Dropdown, Switch,
} from 'antd';

export const TextInput = ({
 name, value, handleChange, ...rest
}) => (
	<Input
		name={name}
		defaultValue={value}
		onChange={handleChange}
		{...rest}
		placeholder={`Enter ${name} here`}
	/>
);

export const NumberInput = ({ name, value, handleChange }) => (
	<Input
		name={name}
		type="number"
		defaultValue={value}
		onChange={handleChange}
		placeholder={`Enter ${name} here`}
	/>
);

export const ToggleInput = ({ name, value, handleChange }) => (
	<Switch defaultChecked={value} onChange={val => handleChange(name, val)} />
);

export class DropdownInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isInputActive: false,
			searchTerm: '',
		};
	}

	handleDropdownChange = (e, name) => {
		const { handleChange } = this.props;
		this.setState({
			isInputActive: false,
		});
		handleChange(e, name);
	};

	handleDropdownSearch = (e) => {
		const {
			target: { name, value },
		} = e;
		this.setState({
			isInputActive: true,
			[name]: value,
		});
	};

	handleDropdownBlur = () => {
		this.setState({
			isInputActive: false,
		});
	};

	render() {
		const { isInputActive, searchTerm } = this.state;
		let { options: dropdownOptions } = this.props;
		const {
            value, name, noOptionsMessage, handleChange,
        } = this.props; // prettier-ignore

		if (isInputActive) {
			dropdownOptions = dropdownOptions.filter(
                option => option.label.toLowerCase().includes(searchTerm.toLowerCase()),
            ); // prettier-ignore
		}

		if (!dropdownOptions.length) {
			dropdownOptions.push({ label: 'No options', key: '' });
		}

		const menu = (
			<Menu
				onClick={e => handleChange(e, name)}
				style={{ maxHeight: 300, overflowY: 'scroll' }}
			>
				{dropdownOptions.map(({ label, key }) => (
					<Menu.Item key={key}>{label}</Menu.Item>
				))}
			</Menu>
		);

		return dropdownOptions.length ? (
			<Dropdown overlay={menu} trigger={['click']}>
				<Input
					style={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
					name="searchTerm"
					onBlur={this.handleDropdownBlur}
					value={isInputActive ? searchTerm : value}
					defaultValue={value}
					onChange={this.handleDropdownSearch}
				/>
			</Dropdown>
		) : (
			noOptionsMessage
		);
	}
}
