import React from 'react';
import { Button, Popover, Row, Col, Icon } from 'antd';
import get from 'lodash/get';
import { dateRangesColumn } from '../../utils';

const DateFilter = ({ visible, toggleVisible, onChange, label }) => {
	return (
		<Popover
			visible={visible}
			trigger="click"
			content={
				<Row style={{ width: 300 }} gutter={[8, 8]}>
					{Object.keys(dateRangesColumn).map((column) => (
						<Col key={column} md={12} span={12}>
							{Object.keys(get(dateRangesColumn, column, {})).map(
								(rangeLabel, index) => (
									<Button
										key={rangeLabel}
										block
										style={{
											marginBottom: index !== 3 ? 8 : 0,
										}}
										type={label === rangeLabel ? 'primary' : 'default'}
										onClick={() => onChange(rangeLabel)}
									>
										{rangeLabel}
									</Button>
								),
							)}
						</Col>
					))}
				</Row>
			}
			placement="leftTop"
		>
			<Button onClick={toggleVisible}>
				<Icon type="clock-circle" />
				{label}
			</Button>
		</Popover>
	);
};

export default DateFilter;
