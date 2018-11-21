import React from 'react';
import { Input, Select, Switch } from 'antd';

const { Option } = Select;

export const TextInput = ({
 name, value, handleChange, ...rest
}) => (
	<Input
		name={name}
		defaultValue={value}
		onChange={e => handleChange({ [name]: e.target.value })}
		{...rest}
		placeholder={`Enter ${name} here`}
	/>
);

export const NumberInput = ({
 name, value, handleChange, placeholder, min,
}) => (
	<Input
		name={name}
		type="number"
		min={min}
		defaultValue={value}
		onChange={e => handleChange({ [name]: e.target.value })}
		placeholder={placeholder || `Enter ${name} here`}
	/>
);

export const ToggleInput = ({ name, value, handleChange }) => (
	<Switch defaultChecked={value} onChange={val => handleChange({ [name]: val })} />
);

export class DropdownInput extends React.Component {
	handleDropdownChange = (value) => {
		const { handleChange, name } = this.props;
		handleChange({ [name]: value });
	};

	render() {
		const { options: dropdownOptions } = this.props;
		const {
            value, name, noOptionsMessage,
        } = this.props; // prettier-ignore

		if (!dropdownOptions.length) {
			dropdownOptions.push({ label: 'No options', key: '' });
		}

		return dropdownOptions.length ? (
			<Select
				showSearch
				value={value}
				placeholder="Select Font family"
				optionFilterProp="children"
				onChange={this.handleDropdownChange}
				filterOption={
					(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
				} // prettier-ignore
			>
				{dropdownOptions.map(option => (
					<Option key={option.key} value={option.key}>
						{option.label}
					</Option>
				))}
			</Select>
		) : (
			noOptionsMessage || 'Nothing to Show'
		);
	}
}
