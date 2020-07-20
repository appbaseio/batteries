import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import get from 'lodash/get';
import Filter from './Filter';
import Searches from './Searches';
import {
	getPopularResults,
	popularResultsFull,
	exportCSVFile,
	applyFilterParams,
	getStringifiedJSON,
	getApp,
} from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { setSearchState } from '../../../modules/actions/app';
import { setFilterValue } from '../../../modules/actions';
import { doGet } from '../../../utils/requestService';
import { getURL } from '../../../../constants/config';
import { withErrorToaster } from '../../shared/ErrorToaster/ErrorToaster';

const headers = {
	key: 'Results',
	count: 'Impressions',
	// clicks: 'Clicks',
	// clickposition: 'Click Position',
	// conversionrate: 'Conversion Rate',
};

class PopularResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			docID: '',
			source: null,
			isLoadingSource: false,
			visible: false,
			popularResults: [],
		};
	}

	componentDidMount() {
		const { filterId, filters, selectFilterValue } = this.props;
		applyFilterParams({
			filters,
			callback: this.fetchPopularResults,
			filterId,
			applyFilter: selectFilterValue,
		});
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			this.fetchPopularResults();
		}
	}

	fetchPopularResults = () => {
		const { appName, filters } = this.props;
		this.setState({
			isFetching: true,
		});
		getPopularResults(appName, undefined, undefined, filters)
			.then((res) => {
				this.setState({
					popularResults: res,
					isFetching: false,
				});
			})
			.catch(() => {
				this.setState({
					isFetching: false,
				});
			});
	};

	handleReplaySearch = (searchState) => {
		const { saveState, history, appName, handleReplayClick } = this.props;
		saveState(searchState);
		if (handleReplayClick) {
			handleReplayClick(appName);
		} else {
			history.push(`/app/${appName}/search-preview`);
		}
	};

	handleOk = () => {
		this.setState({
			visible: false,
		});
	};

	handleCancel = () => {
		this.setState({
			visible: false,
		});
	};

	handleViewSource = async (id) => {
		if (id) {
			const { appName } = this.props;
			this.setState({
				docID: id,
				visible: true,
				isLoadingSource: true,
				source: null,
			});
			try {
				const response = await doGet(
					`${getURL()}/${appName ? getApp(appName) : '*/'}_doc/${id}`,
				);
				this.setState({
					isLoadingSource: false,
					source: response._source,
				});
			} catch (e) {
				console.error('Error while fetching document', id, e);
				this.setState({
					isLoadingSource: false,
				});
			}
		}
	};

	render() {
		const { isFetching, popularResults, visible, docID, isLoadingSource, source } = this.state;
		const { plan, displayReplaySearch, filterId } = this.props;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				{filterId && <Filter filterId={filterId} />}
				<Modal
					title={
						<span>
							Viewing source for <b>{docID}</b>
						</span>
					}
					visible={visible}
					onOk={this.handleOk}
					onCancel={this.handleCancel}
				>
					{isLoadingSource ? 'Loading ...' : <pre>{getStringifiedJSON(source)}</pre>}
				</Modal>
				<Searches
					tableProps={{
						scroll: { x: 1000 },
					}}
					showViewOption={false}
					columns={popularResultsFull(plan, displayReplaySearch, this.handleViewSource)}
					dataSource={popularResults.map((item) => ({
						...item,
						handleReplaySearch: this.handleReplaySearch,
					}))}
					title="Popular Results"
					pagination={{
						pageSize: 10,
					}}
					onClickDownload={() =>
						exportCSVFile(
							headers,
							popularResults.map((item) => ({
								key: item.key,
								count: item.count,
								clicks: item.clicks || '-',
								clickposition: item.clickposition || '-',
								conversionrate: item.conversionrate || '-',
							})),
							'popular_results',
						)
					}
				/>
			</React.Fragment>
		);
	}
}

PopularResults.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
	filterId: undefined,
	filters: undefined,
};

PopularResults.propTypes = {
	filterId: PropTypes.string,
	filters: PropTypes.object,
	plan: PropTypes.string.isRequired,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
	selectFilterValue: PropTypes.func.isRequired,
};

const mapStateToProps = (state, props) => ({
	plan: 'growth',
	appName: get(state, '$getCurrentApp.name'),
	filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
});
const mapDispatchToProps = (dispatch) => ({
	saveState: (state) => dispatch(setSearchState(state)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});
export default withErrorToaster(
	connect(mapStateToProps, mapDispatchToProps)(withRouter(PopularResults)),
);
