import React from 'react';
import Flex from '../Flex';

export default (props) => (
	<Flex justifyContent="center" alignItems="center" css="min-height: 300px;" {...props}>
		<img src="/static/images/loader.svg" alt="loading" />
	</Flex>
);
