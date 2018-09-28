import React from 'react';
import { Spin, Icon, Card } from 'antd';
import PropTypes from 'prop-types';
import Flex from '../../shared/Flex';
import { popularFiltersCol, popularResultsCol } from '../utils';
import { getFilteredResults } from '../../../utils/heplers';
import Searches from './Searches';
import SearchVolumeChart from '../../shared/Chart/SearchVolume';
import SearchLatency from './SearchLatency';
import Summary from './Summary';
import GeoDistribution from './GeoDistribution';

const Analytics = ({
	noResults,
	popularSearches,
	searchVolume,
	popularFilters,
	popularResults,
	chartWidth,
	plan,
	redirectTo,
	loading,
}) => {
	if (loading) {
		const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
		return <Spin indicator={antIcon} />;
	}
	return (
		<React.Fragment>
			<Card title="Summary">
				<Summary />
			</Card>

			<Card css="width: 100%;margin-top: 20px" title="Daily Search Volume">
				<SearchVolumeChart width={chartWidth} height={300} data={searchVolume} />
			</Card>

			<Flex css="width: 100%;margin-top: 20px">
				<div css="flex: 50%;margin-right: 10px">
					<Searches
						onClick={() => redirectTo('popular-searches')}
						dataSource={getFilteredResults(popularSearches)}
						title="Popular Searches"
						plan={plan}
						css="height: 100%"
					/>
				</div>
				<div css="flex: 50%;margin-left: 10px">
					<Searches
						onClick={() => redirectTo('no-results-searches')}
						dataSource={getFilteredResults(noResults)}
						title="No Result Searches"
						plan={plan}
						css="height: 100%"
					/>
				</div>
			</Flex>
			{plan === 'growth' && (
				<React.Fragment>
					<Flex css="width: 100%;margin-top: 20px">
						<div css="flex: 50%;margin-right: 10px">
							<Searches
								dataSource={getFilteredResults(popularResults)}
								columns={popularResultsCol(plan)}
								title="Popular Results"
								onClick={() => redirectTo('popular-results')}
								css="height: 100%"
							/>
						</div>
						<div css="flex: 50%;margin-left: 10px">
							<Searches
								dataSource={getFilteredResults(popularFilters)}
								columns={popularFiltersCol(plan)}
								title="Popular Filters"
								onClick={() => redirectTo('popular-filters')}
								css="height: 100%"
							/>
						</div>
					</Flex>
					<Flex css="width: 100%;margin-top: 20px">
						<GeoDistribution />
					</Flex>
					<Flex css="width: 100%;margin-top: 20px">
						<SearchLatency />
					</Flex>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};
Analytics.defaultProps = {
	loading: false,
	noResults: [],
	popularSearches: [],
	searchVolume: [],
	popularResults: [],
	redirectTo: () => null,
	popularFilters: [],
	chartWidth: window.innerWidth - 300,
};
Analytics.propTypes = {
	loading: PropTypes.bool,
	noResults: PropTypes.array,
	popularSearches: PropTypes.array,
	chartWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	plan: PropTypes.string.isRequired,
	searchVolume: PropTypes.array,
	popularResults: PropTypes.array,
	redirectTo: PropTypes.func,
	popularFilters: PropTypes.array,
};

export default Analytics;
