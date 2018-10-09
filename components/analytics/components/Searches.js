import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
 Card, Table, Button, Tooltip, Icon,
} from 'antd';
import Flex from '../../shared/Flex';
import { defaultColumns } from '../utils';
import EmptyData from '../../shared/EmptyData';

const Searches = ({
	title,
	dataSource,
	columns,
	showViewOption,
	onClick,
	plan,
	pagination,
	onClickDownload,
	href,
	...props
}) => (
	<Card
		title={title}
		extra={
			onClickDownload ? (
				<Tooltip title="Download data in .csv format.">
					<Button disabled={!dataSource.length} onClick={onClickDownload}>
						<Icon type="download" theme="outlined" />
					</Button>
				</Tooltip>
			) : (
				undefined
			)
		}
		bodyStyle={{
			height: '100%',
		}}
		{...props}
	>
		{dataSource.length ? (
			<Flex
				flexDirection="column"
				justifyContent="space-between"
				css="height: calc(100% - 48px)"
			>
				<Table
					rowKey={record => record.key}
					dataSource={dataSource}
					columns={columns || defaultColumns(plan)}
					pagination={pagination}
					css={`
						td {
							vertical-align: top;
						}
					`}
					scroll={{ x: 700 }}
				/>
				{href && (
					<Link to={href}>
						<Button css="width: 100%;height: 50px;margin-top: 10px;">VIEW ALL</Button>
					</Link>
				)}
			</Flex>
		) : (
			<EmptyData />
		)}
	</Card>
);

Searches.defaultProps = {
	pagination: false,
	href: '',
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
	href: PropTypes.string,
	plan: PropTypes.string,
	pagination: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};

export default Searches;
