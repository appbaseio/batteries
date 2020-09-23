import React from 'react';
import { Modal, Button } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getStringifiedJSON } from '../utils';
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

	get indexName() {
		const { appName, index } = this.props;
		return index || appName;
	}

	handleViewSource = async () => {
		const { docID } = this.props;
		this.setState({
			visible: true,
			isLoadingSource: true,
			source: null,
		});
		try {
			// To use the alias for `reindexed` indices because indices may not present
			let alias = this.indexName;
			const splited = this.indexName.split('_reindexed_');
			if (splited[0]) {
				[alias] = splited;
			}
			const response = await doGet(`${getURL()}/${alias}/_doc/${docID}`);
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
				<Button disabled={!this.indexName} onClick={this.handleViewSource}>
					View
				</Button>
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
ViewSource.defaultProps = {
	appName: undefined,
	index: undefined,
};
ViewSource.propTypes = {
	appName: PropTypes.string,
	index: PropTypes.string,
	docID: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
	return {
		appName: get(state, '$getCurrentApp.name'),
	};
};

export default connect(mapStateToProps, null)(ViewSource);
