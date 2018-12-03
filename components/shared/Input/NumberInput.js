import React from 'react';
import {
 func, string, number, any,
} from 'prop-types';
import { Input } from 'antd';

const NumberInput = ({
 name, value, handleChange, placeholder, min, max,
}) => (
	<Input
		name={name}
		type="number"
		min={min}
		max={max}
		defaultValue={value}
		onChange={e => handleChange({ [name]: Number(e.target.value) })}
		placeholder={placeholder || `Enter ${name} here`}
	/>
);

NumberInput.propTypes = {
	handleChange: func.isRequired,
	name: any.isRequired,
	value: number.isRequired,
	min: number,
	max: number,
	placeholder: string,
};

NumberInput.defaultProps = {
	min: null,
	max: null,
	placeholder: '',
};

export default NumberInput;
