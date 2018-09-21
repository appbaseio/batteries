import React from 'react';
import { Icon, Spin } from 'antd';
import Flex from '../Flex';

export default (props) => {
	const antIcon = <Icon type="loading" style={{ fontSize: 50 }} spin />;
	return (
		<Flex justifyContent="center" alignItems="center" css="min-height: 300px;" {...props}>
			<Spin indicator={antIcon} />
		</Flex>
	);
};
