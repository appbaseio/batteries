import React from 'react';
import PropTypes from 'prop-types';
import OverviewContent from './OverviewContent';
import VersionController from '../../../shared/VersionController';

const QueryOverview = ({ query, filterId, displayFilter }) => (
	<React.Fragment>
		<VersionController version="7.31.0">
			<OverviewContent displayFilter={displayFilter} query={query} filterId={filterId} />
		</VersionController>
	</React.Fragment>
);

QueryOverview.defaultProps = {
	displayFilter: false,
};
QueryOverview.propTypes = {
	displayFilter: PropTypes.bool,
	query: PropTypes.string.isRequired,
	filterId: PropTypes.string.isRequired,
};

export default QueryOverview;
