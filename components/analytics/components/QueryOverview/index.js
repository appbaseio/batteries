import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Modal, Button, Tooltip } from 'antd';
import OverviewContent from './OverviewContent';
import VersionController from '../../../shared/VersionController';

const modal = css`
	.ant-modal-content {
		margin: 0 auto;
	}
`;

class QueryOverview extends React.Component {
	state = { visible: false };

	showModal = () => {
		this.setState({
			visible: true,
		});
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

	render() {
		const { visible } = this.state;
		const { query, filterId } = this.props;
		return (
			<React.Fragment>
				<Tooltip placement="rightTop" title="Click to view the query overview.">
					<Button type="link" onClick={this.showModal}>
						{query}
					</Button>
				</Tooltip>

				<Modal
					css={modal}
					width="calc(100vw - 100px)"
					destroyOnClose
					title={
						<span>
							Viewing Overview for query <b>{query}</b>
						</span>
					}
					visible={visible}
					onOk={this.handleOk}
					onCancel={this.handleCancel}
				>
					<VersionController version="7.31.0">
						<OverviewContent query={query} filterId={filterId} />
					</VersionController>
				</Modal>
			</React.Fragment>
		);
	}
}

QueryOverview.propTypes = {
	query: PropTypes.string.isRequired,
	filterId: PropTypes.string.isRequired,
};

export default QueryOverview;
