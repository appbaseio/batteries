import React from 'react';

import Overview from './Overview';
import NodeSummary from './NodeSummary';
import Indices from './Indices';
import Flex from '../shared/Flex';

const Summary = () => {
	return (
		<div>
			<Flex
				justifyContent="space-around"
				css={{
					flexWrap: 'wrap',
				}}
			>
				<Overview />
				<NodeSummary />
				<Indices />
			</Flex>
		</div>
	);
};

export default Summary;
