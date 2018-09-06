import React from 'react';
import PropTypes from 'prop-types';
import Searches from './Searches';
import { getPopularResults, popularResultsFull } from '../utils';
import Loader from '../../shared/Loader/Spinner';

class PopularResults extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: true,
			popularResults: [],
		};
	}

	componentDidMount() {
		const { appName } = this.props;
		getPopularResults(appName)
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
	}

	render() {
		const { isFetching, popularResults } = this.state;
		const { plan } = this.props;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<Searches
				showViewOption={false}
				columns={popularResultsFull(plan)}
				dataSource={popularResults}
				title="Popular Results"
				pagination={{
					pageSize: 10,
				}}
			/>
		);
	}
}

PopularResults.propTypes = {
	plan: PropTypes.string.isRequired,
	appName: PropTypes.string.isRequired,
};
export default PopularResults;
