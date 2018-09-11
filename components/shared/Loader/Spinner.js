import React from 'react';
import { Icon, Spin } from 'antd';
import Flex from '../Flex';

export default (props) => {
	const antIcon = <Icon type="loading" style={{ fontSize: 50, marginTop: '250px' }} spin />;
	return (
		<Flex justifyContent="center" alignItems="center" {...props}>
			<Spin indicator={antIcon} />
		</Flex>
	);
};
