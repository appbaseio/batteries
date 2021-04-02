import React, { Fragment } from 'react';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import { getFilteredResults } from '../../utils/helpers';
import { mediaKey } from '../../utils/media';
import SearchVolumeChart from '../shared/Chart/SearchVolume';
import Flex from '../shared/Flex';
import Searches from './components/Searches';
import { noResultsFull, popularFiltersCol, popularResultsCol, popularSearchesCol } from './utils';

const results = css`
	width: 100%;
	margin-top: 20px;
	${mediaKey.small} {
		flex-direction: column;
	}
`;
const searchCls = css`
	flex: 50%;
	margin-right: 10px;
	${mediaKey.small} {
		margin-right: 0;
	}
`;
const noResultsCls = css`
	flex: 50%;
	margin-left: 10px;
	${mediaKey.small} {
		margin-left: 0;
		margin-top: 20px;
	}
`;

const AdvancedAnalytics = ({
	searchVolume,
	popularSearches,
	noResults,
	popularResults,
	popularFilters,
	plan,
	displayReplaySearch,
	handleReplaySearch,
	onClickViewAll,
}) => {
	// useLayoutEffect(() => {
	// 	console.log('analytics fetched');
	// 	// fetchAnalytics();
	// }, []);

	return (
		<Fragment>
			<SearchVolumeChart height={300} data={searchVolume} />
			<Flex css={results}>
				<div css={searchCls}>
					<Searches
						href="popular-searches"
						dataSource={getFilteredResults(popularSearches).map((item) => ({
							...item,
							handleReplaySearch,
						}))}
						columns={popularSearchesCol(plan, displayReplaySearch)}
						title="Popular Searches"
						css="height: 100%"
						onClickViewAll={(onClickViewAll && onClickViewAll.popularSearches) || null}
					/>
				</div>
				<div css={noResultsCls}>
					<Searches
						href="no-results-searches"
						dataSource={getFilteredResults(noResults).map((item) => ({
							...item,
							handleReplaySearch,
						}))}
						columns={noResultsFull(plan, displayReplaySearch)}
						title="No Result Searches"
						css="height: 100%"
						onClickViewAll={(onClickViewAll && onClickViewAll.noResultsSearch) || null}
					/>
				</div>
			</Flex>
			{plan === 'growth' && (
				<Flex css={results}>
					<div css={searchCls}>
						<Searches
							dataSource={getFilteredResults(popularResults).map((item) => ({
								...item,
								handleReplaySearch,
							}))}
							columns={popularResultsCol(plan, displayReplaySearch)}
							title="Popular Results"
							href="popular-results"
							css="height: 100%"
							onClickViewAll={
								(onClickViewAll && onClickViewAll.popularResults) || null
							}
							breakWord
						/>
					</div>
					<div css={noResultsCls}>
						<Searches
							dataSource={getFilteredResults(popularFilters).map((item) => ({
								...item,
								handleReplaySearch,
							}))}
							columns={popularFiltersCol(plan, displayReplaySearch)}
							title="Popular Filters"
							href="popular-filters"
							css="height: 100%"
							onClickViewAll={
								(onClickViewAll && onClickViewAll.popularFilters) || null
							}
							breakWord
						/>
					</div>
				</Flex>
			)}
		</Fragment>
	);
};

AdvancedAnalytics.defaultProps = {
	searchVolume: [],
	popularSearches: [],
	noResults: [],
	popularResults: [],
	popularFilters: [],
	displayReplaySearch: false,
	onClickViewAll: null,
};

AdvancedAnalytics.propTypes = {
	searchVolume: PropTypes.array,
	popularSearches: PropTypes.array,
	noResults: PropTypes.array,
	popularResults: PropTypes.array,
	popularFilters: PropTypes.array,
	plan: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	handleReplaySearch: PropTypes.func.isRequired,
	onClickViewAll: PropTypes.shape({
		popularFilters: PropTypes.func,
		popularResults: PropTypes.func,
		popularSearches: PropTypes.func,
		noResultsSearch: PropTypes.func,
	}),
};

export default React.memo(AdvancedAnalytics);
