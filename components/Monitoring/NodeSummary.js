import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Skeleton, Icon, Tooltip, Alert } from 'antd';

import Flex from '../shared/Flex';
import { CustomCard, Title } from './MonitoringStyledComponents';
import { fetchNodeSummaryData } from '../../utils/monitoring';
import { messages } from './messages';

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
	}, [timeFilter]);
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
						<Tooltip title={get(messages, 'tooltips.summaryCpuUsage')}>
							<Title>
								CPU Usage <Icon type="info-circle" />
							</Title>
						</Tooltip>
						<span>{get(nodeSummaryData, 'data.cpuUsage', 'N/A')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Tooltip title={get(messages, 'tooltips.summaryHeapUsage')}>
							<Title>
								JVM Heap <Icon type="info-circle" />
							</Title>
						</Tooltip>
						<span>{get(nodeSummaryData, 'data.jvmHeap', 'N/A')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Tooltip title={get(messages, 'tooltips.summaryMemoryUsage')}>
							<Title>
								Memory <Icon type="info-circle" />
							</Title>
						</Tooltip>
						<span>{get(nodeSummaryData, 'data.memory', 'N/A')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Tooltip title={get(messages, 'tooltips.summaryDiskAvailable')}>
							<Title>
								Disk Available <Icon type="info-circle" />
							</Title>
						</Tooltip>
						<span>{get(nodeSummaryData, 'data.disk', 'N/A')}</span>
					</Flex>
					{!nodeSummaryData.data && (
						<Alert
							type="warning"
							message="No Data available for given time frame"
							showIcon
							size="small"
							style={{
								marginTop: 10,
							}}
						/>
					)}
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
