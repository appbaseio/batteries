import React from 'react';
import PropTypes from 'prop-types';
import Searches from './Searches';
import { getPopularFilters, popularFiltersFull } from '../utils';
import Loader from '../../shared/Loader/Spinner';

class PopularFilters extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			popularFilters: [],
		};
	}

	componentDidMount() {
		const { appName } = this.props;
		getPopularFilters(appName)
			.then((res) => {
				this.setState({
					popularFilters: res,
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
		const { isFetching, popularFilters } = this.state;
		const { plan } = this.props;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<Searches
				showViewOption={false}
				columns={popularFiltersFull(plan)}
				dataSource={popularFilters}
				title="Popular Filters"
				pagination={{
					pageSize: 10,
				}}
			/>
		);
	}
}
PopularFilters.propTypes = {
	plan: PropTypes.string.isRequired,
	appName: PropTypes.string.isRequired,
};

export default PopularFilters;
