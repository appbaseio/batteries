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
	loading,
}) => {
	if (loading) {
		const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
		return <Spin indicator={antIcon} />;
	}
	return (
		<React.Fragment>
			<Card css="margin-bottom: 20px" title="Summary">
				<Summary />
			</Card>

			<Card css="width: 100%;" title="Daily Search Volume">
				<SearchVolumeChart
					width={chartWidth || window.innerWidth - 300}
					height={300}
					data={searchVolume}
				/>
			</Card>

			<Flex css="width: 100%;margin-top: 20px">
				<div css="flex: 50%;margin-right: 10px">
					<Searches
						href="popular-searches"
						dataSource={getFilteredResults(popularSearches)}
						title="Popular Searches"
						plan={plan}
						css="height: 100%"
					/>
				</div>
				<div css="flex: 50%;margin-left: 10px">
					<Searches
						href="no-results-searches"
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
								href="popular-results"
								css="height: 100%"
							/>
						</div>
						<div css="flex: 50%;margin-left: 10px">
							<Searches
								dataSource={getFilteredResults(popularFilters)}
								columns={popularFiltersCol(plan)}
								title="Popular Filters"
								href="popular-filters"
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
	popularFilters: [],
	chartWidth: undefined,
};
Analytics.propTypes = {
	loading: PropTypes.bool,
	noResults: PropTypes.array,
	popularSearches: PropTypes.array,
	chartWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	plan: PropTypes.string.isRequired,
	searchVolume: PropTypes.array,
	popularResults: PropTypes.array,
	popularFilters: PropTypes.array,
};

export default Analytics;
