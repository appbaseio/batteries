import React from 'react';
import PropTypes from 'prop-types';
import {
 Card, Table, Button, Tooltip, Icon,
} from 'antd';
import { defaultColumns } from '../utils';

const Searches = ({
	title,
	dataSource,
	columns,
	showViewOption,
	onClick,
	plan,
	pagination,
	onClickDownload,
}) => (
	<Card
		title={title}
		extra={
			onClickDownload ? (
				<Tooltip title="Download data in .csv format.">
					<Button onClick={onClickDownload}>
						<Icon type="download" theme="outlined" />
					</Button>
				</Tooltip>
			) : (
				undefined
			)
		}
	>
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
	columns: undefined,
	onClickDownload: undefined,
};
Searches.propTypes = {
	title: PropTypes.string,
	dataSource: PropTypes.array,
	onClickDownload: PropTypes.func,
	columns: PropTypes.array,
	showViewOption: PropTypes.bool,
	onClick: PropTypes.func,
	plan: PropTypes.string,
	pagination: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

export default Searches;
