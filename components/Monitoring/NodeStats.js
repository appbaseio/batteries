import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { Table } from 'antd';

import { fetchNodeStats } from '../../utils/monitoring';

const NodeStats = ({ config, timeFilter }) => {
	const [nodeData, setNodeData] = useState({
		loading: true,
		data: [],
	});

	useEffect(() => {
		let isMounted = true;
		const getData = async () => {
			const nodeDataRes = await fetchNodeStats(config, timeFilter);
			console.log({ nodeDataRes });
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
	}, []);

	const columns = [
		{
			title: 'Node',
			dataIndex: 'key',
			key: 'key',
		},
		{
			title: 'CPU Usage',
			dataIndex: 'cpuUsage',
			key: 'cpuUsage',
		},
		{
			title: 'JVM Heap',
			dataIndex: 'jvmHeap',
			key: 'jvmHeap',
		},
		{
			title: 'Memory',
			dataIndex: 'memory',
			key: 'memory',
		},
		{
			title: 'Documents',
			dataIndex: 'documents',
			key: 'documents',
		},
		{
			title: 'Disk Available',
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
				expandedRowRender={(record) => <p style={{ margin: 0 }}>{record.key}</p>}
			/>
		</div>
	);
};

NodeStats.propTypes = {
	config: PropTypes.object.isRequired,
	timeFilter: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	return {
		config: get(state, '$monitoring.config', {}),
		timeFilter: get(state, '$monitoring.filter.time', ''),
	};
};

export default connect(mapStateToProps)(NodeStats);
