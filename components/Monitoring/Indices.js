import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip, Alert } from 'antd';

import Flex from '../shared/Flex';
import { CustomCard, Title, Value } from './MonitoringStyledComponents';
import { fetchIndicesData } from '../../utils/monitoring';
import { messages } from './messages';

const Indices = ({ config, timeFilter }) => {
	const [indicesData, setIndicesData] = useState({
		loading: true,
		data: {},
	});
	useEffect(() => {
		let isMounted = true;
		async function getIndicesData() {
			const indicesResponse = await fetchIndicesData(config, timeFilter);
			if (isMounted) {
				setIndicesData({
					loading: false,
					data: indicesResponse,
				});
			}
		}

		getIndicesData();

		return () => {
			isMounted = false;
		};
	}, [timeFilter]);

	return (
        <CustomCard
			title={`Indices${
				get(indicesData, 'data.indices') ? `: ${get(indicesData, 'data.indices')}` : ''
			}`}
		>
			{indicesData.loading ? (
				<Skeleton active />
			) : (
				<>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Tooltip title={get(messages, 'tooltips.summaryDocuments')}>
							<Title>
								Documents <InfoCircleOutlined />
							</Title>
						</Tooltip>
						<Value>{get(indicesData, 'data.documents', 'N/A')}</Value>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Tooltip title={get(messages, 'tooltips.summaryData', 'N/A')}>
							<Title>
								Data <InfoCircleOutlined />
							</Title>
						</Tooltip>
						<Value>{get(indicesData, 'data.data', 'N/A')}</Value>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Tooltip title={get(messages, 'tooltips.summaryPrimaryShards', 'N/A')}>
							<Title>
								Primary Shards <InfoCircleOutlined />
							</Title>
						</Tooltip>
						<Value>{get(indicesData, 'data.primaryShards', 'N/A')}</Value>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Tooltip title={get(messages, 'tooltips.summaryReplicaShards')}>
							<Title>
								Replica Shards <InfoCircleOutlined />
							</Title>
						</Tooltip>
						<Value>{get(indicesData, 'data.replicaShards', 'N/A')}</Value>
					</Flex>
					{!indicesData.data && (
						<Alert
							type="warning"
							message="No data available for given time frame"
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

Indices.propTypes = {
	config: PropTypes.object.isRequired,
	timeFilter: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	return {
		config: get(state, '$monitoring.config', {}),
		timeFilter: get(state, '$monitoring.filter.time', ''),
	};
};

export default connect(mapStateToProps)(Indices);
