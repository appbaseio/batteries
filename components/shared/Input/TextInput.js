import React from 'react';
import { func, string } from 'prop-types';
import { Input } from 'antd';

const TextInput = ({
 name, value, handleChange, placeholder,
}) => (
	<Input
		name={name}
		defaultValue={value}
		onChange={e => handleChange({ [name]: e.target.value })}
		placeholder={placeholder || `Enter ${name} here`}
	/>
);

TextInput.propTypes = {
	handleChange: func.isRequired,
	name: string.isRequired,
	value: string.isRequired,
	placeholder: string,
};

TextInput.defaultProps = {
	placeholder: '',
};

export default TextInput;
