import React from 'react';
import get from 'lodash/get';
import { Card } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

function versionCompare(v1, v2, options) {
	const lexicographical = options && options.lexicographical;
	const zeroExtend = options && options.zeroExtend;
	let v1parts = v1.split('.');
	let v2parts = v2.split('.');

	function isValidPart(x) {
		return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
	}

	if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
		return NaN;
	}

	if (zeroExtend) {
		while (v1parts.length < v2parts.length) v1parts.push('0');
		while (v2parts.length < v1parts.length) v2parts.push('0');
	}

	if (!lexicographical) {
		v1parts = v1parts.map(Number);
		v2parts = v2parts.map(Number);
	}
	/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
	for (let i = 0; i < v1parts.length; ++i) {
		if (v2parts.length === i) {
			return 1;
		}
		if (v1parts[i] === v2parts[i]) {
			/* eslint-disable-next-line */
			continue;
		} else if (v1parts[i] > v2parts[i]) {
			return 1;
		} else {
			return -1;
		}
	}

	if (v1parts.length !== v2parts.length) {
		return -1;
	}

	return 0;
}

const VersionController = ({ version, arcVersion, children, title, style }) => {
	// If arc version is less than the version specified for feature then render the upgrade component
	if (versionCompare(arcVersion, version) === -1) {
		return (
			<Card title={title} style={style}>
				<div>
					This feature requires the minimum version of Arc to be <b>{version}</b>. Your
					current arc version is <b>{arcVersion}</b>, you can upgrade your arc version in
					just one click from the{' '}
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://dashboard.appbase.io/"
					>
						Appbase.io
					</a>{' '}
					dashboard.
				</div>
			</Card>
		);
	}
	return children;
};
VersionController.defaultProps = {
	title: 'Update Arc Version',
};
VersionController.propTypes = {
	// User props
	title: PropTypes.string,
	style: PropTypes.object,
	version: PropTypes.string.isRequired,
	children: PropTypes.string.isRequired,
	// System props
	arcVersion: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	arcVersion: get(state, '$getAppPlan.results.version'),
});
export default connect(mapStateToProps)(VersionController);
