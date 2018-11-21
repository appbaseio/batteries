import React from 'react';
import {
 func, string, array, any,
} from 'prop-types';
import { Select } from 'antd';

const { Option } = Select;

class DropdownInput extends React.Component {
	handleDropdownChange = (value) => {
		const { handleChange, name } = this.props;
		handleChange({ [name]: value });
	};

	render() {
		const { options: dropdownOptions } = this.props;
		const {
            value, noOptionsMessage,
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
			noOptionsMessage
		);
	}
}

DropdownInput.propTypes = {
	handleChange: func.isRequired,
	name: any.isRequired,
	value: string.isRequired,
	noOptionsMessage: string,
	options: array,
};

DropdownInput.defaultProps = {
	noOptionsMessage: 'Nothing to Show',
	options: [],
};

export default DropdownInput;
