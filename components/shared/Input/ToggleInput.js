import React from 'react';
import { func, string } from 'prop-types';
import { Switch } from 'antd';

const ToggleInput = ({ name, value, handleChange }) => (
	<Switch defaultChecked={value} onChange={val => handleChange({ [name]: val })} />
);

ToggleInput.propTypes = {
	handleChange: func.isRequired,
	name: string.isRequired,
	value: string.isRequired,
};

export default ToggleInput;
