import React from 'react';
import { func, string, any } from 'prop-types';
import { Input } from 'antd';

const TextInput = ({ name, value, handleChange, placeholder }) => (
	<Input
		name={name}
		defaultValue={value}
		onChange={(e) => handleChange({ [name]: e.target.value })}
		placeholder={placeholder || `Enter ${name} here`}
	/>
);

TextInput.propTypes = {
	handleChange: func.isRequired,
	name: any.isRequired,
	value: string,
	placeholder: string,
};

TextInput.defaultProps = {
	placeholder: '',
	value: '',
};

export default TextInput;
