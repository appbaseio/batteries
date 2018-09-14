import React from 'react';
import { Card } from 'antd';
import { connect } from 'react-redux';
import { getAppSearchLatency } from '../../../../modules/actions';

class SearchLatency extends React.Component {
	componentDidMount() {
		const { fetchAppSearchLatency } = this.props;
		fetchAppSearchLatency();
	}

	render() {
		return <Card css="width: 100%" title="Search Performance" />;
	}
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
	fetchAppSearchLatency: appName => dispatch(getAppSearchLatency(appName)),
});
export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(SearchLatency);
