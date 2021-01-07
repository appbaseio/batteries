import React from 'react';
import { Row, Col } from 'antd';

import Overview from './Overview';
import NodeSummary from './NodeSummary';
import Indices from './Indices';

const Summary = () => {
	return (
		<div>
			<Row>
				<Col xs={{ span: 5, offset: 1 }} lg={{ span: 7, offset: 0 }}>
					<Overview />
				</Col>
				<Col xs={{ span: 5, offset: 1 }} lg={{ span: 7, offset: 1 }}>
					<NodeSummary />
				</Col>
				<Col xs={{ span: 5, offset: 1 }} lg={{ span: 7, offset: 1 }}>
					<Indices />
				</Col>
			</Row>
		</div>
	);
};

export default Summary;
