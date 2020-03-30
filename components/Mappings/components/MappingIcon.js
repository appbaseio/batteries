import React from 'react';
import { Icon } from 'antd';

const MappingIcon = ({ type }) => {
	const iconStyle = { margin: 0, fontSize: 13 };
	switch (type) {
		case 'text':
		case 'string':
		case 'keyword':
			return <Icon style={iconStyle} type="file-text" theme="outlined" />;
		case 'long':
		case 'integer':
			return <div style={iconStyle}>#</div>;
		case 'geo_point':
		case 'geo_shape':
			return <Icon style={iconStyle} type="environment" theme="outlined" />;
		case 'date':
			return <Icon style={iconStyle} type="calendar" theme="outlined" />;
		case 'double':
		case 'float':
			return <div style={iconStyle}>π</div>;
		case 'boolean':
			return <Icon style={iconStyle} type="check" theme="outlined" />;
		case 'object':
			return <div style={iconStyle}>{'{...}'}</div>;
		case 'image':
			return <Icon style={iconStyle} type="file-jpg" theme="outlined" />;
		default:
			return <Icon style={iconStyle} type="file-unknown" theme="outlined" />;
	}
};

export default MappingIcon;
