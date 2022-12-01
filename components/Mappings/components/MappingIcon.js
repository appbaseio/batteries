import React from 'react';

import {
    CalendarOutlined,
    CheckOutlined,
    EnvironmentOutlined,
    FileJpgOutlined,
    FileTextOutlined,
    FileUnknownOutlined,
} from '@ant-design/icons';

const MappingIcon = ({ type }) => {
	const iconStyle = { margin: 0, fontSize: 13 };
	switch (type) {
		case 'text':
		case 'string':
		case 'keyword':
			return <FileTextOutlined style={iconStyle} />;
		case 'long':
		case 'integer':
			return <div style={iconStyle}>#</div>;
		case 'geo_point':
		case 'geo_shape':
			return <EnvironmentOutlined style={iconStyle} />;
		case 'date':
			return <CalendarOutlined style={iconStyle} />;
		case 'double':
		case 'float':
			return <div style={iconStyle}>π</div>;
		case 'boolean':
			return <CheckOutlined style={iconStyle} />;
		case 'object':
			return <div style={iconStyle}>{'{...}'}</div>;
		case 'image':
			return <FileJpgOutlined style={iconStyle} />;
		default:
			return <FileUnknownOutlined style={iconStyle} />;
	}
};

export default MappingIcon;
