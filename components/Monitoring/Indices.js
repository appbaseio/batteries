import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Skeleton } from 'antd';

import Flex from '../shared/Flex';
import { CustomCard, Title } from './MonitoringStyledComponents';
import { fetchIndicesData } from '../../utils/monitoring';

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
	}, []);
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
						<Title>Documents</Title>
						<span>{get(indicesData, 'data.documents')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Title>Data</Title>
						<span>{get(indicesData, 'data.data')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Title>Primary Shards</Title>
						<span>{get(indicesData, 'data.primaryShards')}</span>
					</Flex>
					<Flex justifyContent="space-between" style={{ paddingTop: 10 }}>
						<Title>Replica Shards</Title>
						<span>{get(indicesData, 'data.replicaShards')}</span>
					</Flex>
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
