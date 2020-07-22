import React from 'react';
import { Modal, Button } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getStringifiedJSON, getApp } from '../utils';
import { doGet } from '../../../utils/requestService';
import { getURL } from '../../../../constants/config';

class ViewSource extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			source: null,
			isLoadingSource: false,
			visible: false,
		};
	}

	handleViewSource = async () => {
		const { docID } = this.props;
		const { appName } = this.props;
		this.setState({
			visible: true,
			isLoadingSource: true,
			source: null,
		});
		try {
			const response = await doGet(`${getURL()}/${getApp(appName)}_doc/${docID}`);
			this.setState({
				isLoadingSource: false,
				source: response._source,
			});
		} catch (e) {
			console.error('Error while fetching document', docID, e);
			this.setState({
				isLoadingSource: false,
			});
		}
	};

	handleCancel = () => {
		this.setState({
			visible: false,
		});
	};

	handleOk = () => {
		this.setState({
			visible: false,
		});
	};

	render() {
		const { visible, isLoadingSource, source } = this.state;
		const { docID } = this.props;
		return (
			<React.Fragment>
				<Button onClick={this.handleViewSource}>View</Button>
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
			</React.Fragment>
		);
	}
}

ViewSource.propTypes = {
	appName: PropTypes.string.isRequired,
	docID: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	appName: get(state, '$getCurrentApp.name'),
});

export default connect(mapStateToProps, null)(ViewSource);
