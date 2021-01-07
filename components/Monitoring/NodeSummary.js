import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import { Skeleton } from 'antd';
import Flex from '../shared/Flex';
import { CustomCard, Title } from './MonitoringStyledComponents';
import { fetchNodeSummaryData } from '../../utils/monitoring';

const NodeSummary = ({ config, timeFilter }) => {
	const [nodeSummaryData, setNodeSummaryData] = useState({
		loading: true,
		data: {},
	});
	useEffect(() => {
		let isMounted = true;
		async function getNodeSummaryData() {
			const nodeSummaryResponse = await fetchNodeSummaryData(config, timeFilter);
			if (isMounted) {
				setNodeSummaryData({
					loading: false,
					data: nodeSummaryResponse,
				});
			}
		}

		getNodeSummaryData();

		return () => {
			isMounted = false;
		};
	}, []);
	return (
		<CustomCard
			title={`Nodes${
				get(nodeSummaryData, 'data.nodes') ? `: ${get(nodeSummaryData, 'data.nodes')}` : ''
			}`}
		>
			{nodeSummaryData.loading ? (
				<Skeleton active />
			) : (
				<>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Title>CPU Usage</Title>
						<span>{get(nodeSummaryData, 'data.cpuUsage')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Title>JVM Heap</Title>
						<span>{get(nodeSummaryData, 'data.jvmHeap')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Title>Memory</Title>
						<span>{get(nodeSummaryData, 'data.memory')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Title>Disk Available</Title>
						<span>{get(nodeSummaryData, 'data.disk')}</span>
					</Flex>
				</>
			)}
		</CustomCard>
	);
};

NodeSummary.propTypes = {
	config: PropTypes.object.isRequired,
	timeFilter: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	return {
		config: get(state, '$monitoring.config', {}),
		timeFilter: get(state, '$monitoring.filter.time', ''),
	};
};

export default connect(mapStateToProps)(NodeSummary);
