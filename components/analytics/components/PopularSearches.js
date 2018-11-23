import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Searches from './Searches';
import { getPopularSearches, popularSearchesFull, exportCSVFile } from '../utils';
import Loader from '../../shared/Loader/Spinner';
import { getAppPlanByName } from '../../../modules/selectors';

const headers = {
	key: 'Search Terms',
	count: 'Total Queries',
	clicks: 'Clicks',
	clickposition: 'Click Position',
	conversionrate: 'Conversion Rate',
};
class PopularSearches extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			popularSearches: [],
		}; 
	}

	componentDidMount() {
		const { appName } = this.props;
		getPopularSearches(appName)
			.then((res) => {
				this.setState({
					popularSearches: res,
					isFetching: false,
				});
			})
			.catch(() => {
				this.setState({
					isFetching: false,
				});
			});
	}

	render() {
		const { isFetching, popularSearches } = this.state;
		const { plan } = this.props;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<Searches
				tableProps={{
					scroll: { x: 700 },
				}}
				showViewOption={false}
				columns={popularSearchesFull(plan)}
				dataSource={popularSearches}
				title="Popular Searches"
				onClickDownload={() => exportCSVFile(
						headers,
						popularSearches.map(item => ({
							key: item.key,
							count: item.count,
							clicks: item.clicks || '-',
							clickposition: item.clickposition || '-',
							conversionrate: item.conversionrate || '-',
						})),
						'popular_searches',
					)
				}
				pagination={{
					pageSize: 10,
				}}
			/>
		);
	}
}
PopularSearches.propTypes = {
	plan: PropTypes.string.isRequired,
	appName: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	const appPlan = getAppPlanByName(state);
	return {
		plan: get(appPlan, 'plan'),
		appName: get(state, '$getCurrentApp.name'),
	};
};
export default connect(mapStateToProps)(PopularSearches);
