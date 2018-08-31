import React from 'react';
import PropTypes from 'prop-types';
import Searches from './Searches';
import { getNoResultSearches } from './../utils';
import Loader from './../../shared/Loader/Spinner';

class NoResultsSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			noResults: [],
		};
	}
	componentDidMount() {
		getNoResultSearches(this.props.appName)
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
		if (this.state.isFetching) {
			return <Loader />;
		}
		return (
			<Searches
				showViewOption={false}
				dataSource={this.state.noResults}
				title="No Results Searches"
				pagination={{
					pageSize: 10,
				}}
			/>
		);
	}
}
NoResultsSearch.propTypes = {
	appName: PropTypes.string,
};
export default NoResultsSearch;
