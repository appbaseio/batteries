import React from 'react';
import { func, any, bool } from 'prop-types';
import { Switch } from 'antd';

const ToggleInput = ({ name, value, handleChange }) => (
	<Switch defaultChecked={value} onChange={val => handleChange({ [name]: val })} />
);

ToggleInput.propTypes = {
	handleChange: func.isRequired,
	name: any.isRequired,
	value: bool.isRequired,
};

export default ToggleInput;
