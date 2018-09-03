import React from 'react';
import PropTypes from 'prop-types';
import { Card, Table, Button } from 'antd';
import { defaultColumns } from '../utils';

const Searches = ({
 title, dataSource, columns, showViewOption, onClick, plan, pagination,
}) => (
	<Card title={title}>
		<Table
			rowKey={record => record.key}
			dataSource={dataSource}
			columns={columns || defaultColumns(plan)}
			pagination={pagination}
		/>
		{showViewOption && (
			<Button onClick={() => onClick()} css="width: 100%;height: 50px;margin-top: 10px;">
				VIEW ALL
			</Button>
		)}
	</Card>
);

Searches.defaultProps = {
	showViewOption: true,
	pagination: false,
	onClick: () => null,
	title: '',
	dataSource: [],
	plan: '',
	columns: [],
};
Searches.propTypes = {
	title: PropTypes.string,
	dataSource: PropTypes.array,
	columns: PropTypes.array,
	showViewOption: PropTypes.bool,
	onClick: PropTypes.func,
	plan: PropTypes.string,
	pagination: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

export default Searches;
