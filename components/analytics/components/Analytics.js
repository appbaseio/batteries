import React, { useEffect, useState } from 'react';
import { Spin, Icon, Card } from 'antd';
import PropTypes from 'prop-types';
import Filter from './Filter';
import Flex from '../../shared/Flex';
import { inViewPort } from '../utils';
import SearchLatency from './SearchLatency';
import Summary from './Summary';
import GeoDistribution from './GeoDistribution';
import RequestDistribution from './RequestDistribution';
import RequestLogs from './RequestLogs';
import AdvancedAnalytics from '../AdvancedAnalytics';

const handleClickBar = (payload) => {
	const startLatency = payload.key;
	const endLatency = startLatency + 10;
	const newURL = `${window.location.protocol}//${
		window.location.host
	}${window.location.pathname.replace(
		'analytics',
		'search-latency',
	)}?start_latency=${startLatency}&end_latency=${endLatency}&redirect_to=logs`;
	window.location.href = newURL;
};
const Analytics = ({
	plan,
	loading,
	onClickViewAll,
	displayReplaySearch,
	handleReplaySearch,
	filterId,
	appName,
}) => {
	useEffect(() => {
		window.addEventListener('scroll', tracker);
		const initTracker = setTimeout(() => {
			tracker();
		}, 0);
		return () => {
			window.removeEventListener('scroll', tracker);
			if (initTracker) {
				clearTimeout(initTracker);
			}
		};
	}, []);

	const [visibility, setVisibility] = useState({
		'summary-component': false,
		'advanced-analytics-component': false,
		'geo-distribution-component': false,
		'search-latency-component': false,
		'request-distribution-component': false,
		'request-logs-component': false,
	});

	const tracker = () => {
		Object.keys(visibility).forEach((key) => {
			if (inViewPort(key) && !visibility[key]) {
				setVisibility((prev) => ({ ...prev, [key]: true }));
			}
		});
	};

	if (loading) {
		const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
		return <Spin indicator={antIcon} />;
	}

	return (
		<React.Fragment>
			{filterId && <Filter filterId={filterId} />}
			<Card
				extra={
					<a href="https://docs.appbase.io/docs/analytics/Overview/">
						Read More about these stats
					</a>
				}
				css="margin-bottom: 20px"
				title="Summary"
				id="summary-component"
			>
				{visibility['summary-component'] && <Summary filterId={filterId} />}
			</Card>
			<div id="advanced-analytics-component">
				{visibility['advanced-analytics-component'] && (
					<AdvancedAnalytics
						plan={plan}
						displayReplaySearch={displayReplaySearch}
						handleReplaySearch={handleReplaySearch}
						onClickViewAll={onClickViewAll}
					/>
				)}
			</div>
			{plan === 'growth' && (
				<React.Fragment>
					<Flex
						flexDirection="column"
						css="width: 100%;margin-top: 20px"
						id="geo-distribution-component"
					>
						{visibility['geo-distribution-component'] && (
							<GeoDistribution filterId={filterId} displayFilter={false} />
						)}
					</Flex>
					<Flex
						flexDirection="column"
						css="width: 100%;margin-top: 20px"
						id="search-latency-component"
					>
						{visibility['search-latency-component'] && (
							<SearchLatency
								onClickBar={handleClickBar}
								filterId={filterId}
								displayFilter={false}
							/>
						)}
					</Flex>
					<Flex
						flexDirection="column"
						css="width: 100%;margin-top: 20px"
						id="request-distribution-component"
					>
						{visibility['request-distribution-component'] && (
							<RequestDistribution filterId={filterId} displayFilter={false} />
						)}
					</Flex>
					<Flex
						flexDirection="column"
						css="width: 100%;margin-top: 20px"
						id="request-logs-component"
					>
						{visibility['request-logs-component'] && (
							<RequestLogs displayFilter={false} appName={appName} />
						)}
					</Flex>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};
Analytics.defaultProps = {
	loading: false,
	onClickViewAll: null,
	displayReplaySearch: false,
	filterId: undefined,
	appName: undefined,
};
Analytics.propTypes = {
	onClickViewAll: PropTypes.shape({
		popularFilters: PropTypes.func,
		popularResults: PropTypes.func,
		popularSearches: PropTypes.func,
		noResultsSearch: PropTypes.func,
	}),
	filterId: PropTypes.string,
	loading: PropTypes.bool,
	displayReplaySearch: PropTypes.bool,
	plan: PropTypes.string.isRequired,
	handleReplaySearch: PropTypes.func.isRequired,
	appName: PropTypes.string,
};

export default Analytics;
