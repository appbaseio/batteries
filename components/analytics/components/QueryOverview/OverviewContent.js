import React from 'react';
import { connect } from 'react-redux';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { withErrorToaster } from '../../../shared/ErrorToaster/ErrorToaster';
import { getAppQueryOverview } from '../../../../modules/actions';
import Loader from '../../../shared/Loader/Spinner';
import { getAppQueryOverviewByName } from '../../../../modules/selectors';
import SearchVolumeChart from '../../../shared/Chart/SearchVolume';
import Flex from '../../../shared/Flex';
import { mediaKey } from '../../../../utils/media';
import ViewSource from '../ViewSource';
import Searches from '../Searches';
import { topClicksColumns, topResultsColumns } from '../../utils';

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

class OverviewContent extends React.Component {
	componentDidMount() {
		const { fetchAppQueryOverview } = this.props;
		fetchAppQueryOverview();
	}

	render() {
		const { isLoading, histogram, topClicks, topResults } = this.props;
		return (
			<div>
				{isLoading ? (
					<Loader />
				) : (
					<div>
						<SearchVolumeChart height={300} data={histogram} />
						<Flex css={results}>
							<div css={searchCls}>
								<Searches
									dataSource={topClicks}
									columns={topClicksColumns()}
									title="Top Clicks"
									css="height: 100%"
								/>
							</div>
							<div css={noResultsCls}>
								<Searches
									dataSource={topResults}
									columns={topResultsColumns(ViewSource)}
									title="Top Results"
									css="height: 100%"
								/>
							</div>
						</Flex>
					</div>
				)}
			</div>
		);
	}
}

OverviewContent.defaultProps = {
	isLoading: false,
	histogram: [],
	topClicks: [],
	topResults: [],
};
OverviewContent.propTypes = {
	// eslint-disable-next-line
	filterId: PropTypes.string.isRequired,
	// eslint-disable-next-line
	query: PropTypes.string.isRequired,
	isLoading: PropTypes.bool,
	fetchAppQueryOverview: PropTypes.func.isRequired,
	histogram: PropTypes.array,
	topClicks: PropTypes.array,
	topResults: PropTypes.array,
};

const mapStateToProps = (state) => {
	const queryOverview = getAppQueryOverviewByName(state);
	return {
		histogram: get(queryOverview, 'histogram'),
		topClicks: get(queryOverview, 'top_clicks'),
		topResults: get(queryOverview, 'top_results'),
		isLoading: get(state, '$getAppQueryOverview.isFetching'),
	};
};
const mapDispatchToProps = (dispatch, props) => ({
	fetchAppQueryOverview: (appName) =>
		dispatch(getAppQueryOverview(appName, props.filterId, props.query)),
});

export default withErrorToaster(connect(mapStateToProps, mapDispatchToProps)(OverviewContent));
