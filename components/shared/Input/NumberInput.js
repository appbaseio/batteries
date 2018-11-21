import React from 'react';
import { func, string, number } from 'prop-types';
import { Input } from 'antd';

const NumberInput = ({
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

NumberInput.propTypes = {
	handleChange: func.isRequired,
	name: string.isRequired,
	value: string.isRequired,
	min: number,
	placeholder: string,
};

NumberInput.defaultProps = {
	min: null,
	placeholder: '',
};

export default NumberInput;
