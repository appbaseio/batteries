import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Table, Tooltip } from 'antd';

import { fetchNodeStats } from '../../utils/monitoring';
import { messages } from './messages';
import NodeGraphs from './NodeGraphs';

const NodeStats = ({ config, timeFilter }) => {
	const [nodeData, setNodeData] = useState({
		loading: true,
		data: [],
	});

	useEffect(() => {
		let isMounted = true;
		const getData = async () => {
			const nodeDataRes = await fetchNodeStats(config, timeFilter);
			if (isMounted) {
				setNodeData({
					loading: false,
					data: nodeDataRes,
				});
			}
		};

		getData();
		return () => {
			isMounted = false;
		};
	}, [timeFilter]);

	const columns = [
		{
			title: 'Node',
			dataIndex: 'node',
			key: 'node',
		},
		{
			title: (
				<Tooltip title={get(messages, 'tooltips.tableCpuUsage')}>
					<span>
						CPU Usage <InfoCircleOutlined />
					</span>
				</Tooltip>
			),
			dataIndex: 'cpuUsage',
			key: 'cpuUsage',
		},
		{
			title: (
				<Tooltip title={get(messages, 'tooltips.tableJvmHeap')}>
					<span>
						JVM Heap <InfoCircleOutlined />
					</span>
				</Tooltip>
			),
			dataIndex: 'jvmHeap',
			key: 'jvmHeap',
		},
		{
			title: (
				<Tooltip title={get(messages, 'tooltips.tableMemory')}>
					<span>
						Memory <InfoCircleOutlined />
					</span>
				</Tooltip>
			),
			dataIndex: 'memory',
			key: 'memory',
		},
		{
			title: (
				<Tooltip title={get(messages, 'tooltips.tableDocuments')}>
					<span>
						Documents <InfoCircleOutlined />
					</span>
				</Tooltip>
			),
			dataIndex: 'documents',
			key: 'documents',
		},
		{
			title: (
				<Tooltip title={get(messages, 'tooltips.tableDiskAvailable')}>
					<span>
						Disk Available <InfoCircleOutlined />
					</span>
				</Tooltip>
			),
			dataIndex: 'disk',
			key: 'disk',
		},
	];

	return (
		<div>
			<Table
				dataSource={nodeData.data}
				columns={columns}
				loading={nodeData.loading}
				bordered
				pagination={false}
				expandedRowRender={record => (
					<NodeGraphs nodeKey={record.key} />
				)}
				locale={{
					emptyText: `No data available for given time frame`,
				}}
			/>
		</div>
	);
};

NodeStats.propTypes = {
	config: PropTypes.object.isRequired,
	timeFilter: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
	return {
		config: get(state, '$monitoring.config', {}),
		timeFilter: get(state, '$monitoring.filter.time', ''),
	};
};

export default connect(mapStateToProps)(NodeStats);
