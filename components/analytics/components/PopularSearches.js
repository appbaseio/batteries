import React from 'react';
import PropTypes from 'prop-types';
import Searches from './Searches';
import { getPopularSearches, popularSearchesFull } from '../utils';
import Loader from '../../shared/Loader/Spinner';

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
				showViewOption={false}
				columns={popularSearchesFull(plan)}
				dataSource={popularSearches}
				title="Popular Searches"
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

export default PopularSearches;
