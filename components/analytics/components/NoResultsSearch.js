import React from 'react';
import PropTypes from 'prop-types';
import Searches from './Searches';
import { getNoResultSearches } from '../utils';
import Loader from '../../shared/Loader/Spinner';

class NoResultsSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			noResults: [],
		};
	}

	componentDidMount() {
		const { appName } = this.props;
		getNoResultSearches(appName)
			.then((res) => {
				this.setState({
					noResults: res,
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
		const { isFetching, noResults } = this.state;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<Searches
				showViewOption={false}
				dataSource={noResults}
				title="No Results Searches"
				pagination={{
					pageSize: 10,
				}}
			/>
		);
	}
}
NoResultsSearch.propTypes = {
	appName: PropTypes.string.isRequired,
};
export default NoResultsSearch;
