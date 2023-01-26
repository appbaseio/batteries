import React from 'react';
import get from 'lodash/get';
import { Card } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { versionCompare } from '../../../utils/helpers';

const VersionController = ({ version, arcVersion, children, title, style, backendImage }) => {
	// If arc version is less than the version specified for feature then render the upgrade component
	if (backendImage !== 'multi-tenant-sls' && versionCompare(arcVersion, version) === -1) {
		return (
			<Card title={title} style={style}>
				<div>
					This feature requires the minimum version of appbase.io to be <b>{version}</b>.
					Your current version is <b>{arcVersion}</b>, you can upgrade your version from
					the cluster detail view of the dashboard.
				</div>
			</Card>
		);
	}
	return children;
};
VersionController.defaultProps = {
	title: 'Upgrade Appbase.io Version',
	style: null,
};
VersionController.propTypes = {
	// User props
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	style: PropTypes.object,
	version: PropTypes.string.isRequired,
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
	// System props
	arcVersion: PropTypes.string.isRequired,
	backendImage: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	arcVersion: get(state, '$getAppPlan.results.version'),
	backendImage: get(state, '$getAppPlan.results.image_type') ?? '',
});
export default connect(mapStateToProps)(VersionController);
