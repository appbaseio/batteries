import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Button, Popover, Row, Col } from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { dateRangesColumn, dateRanges as defaultDateRanges } from '../../utils';

const DateFilter = ({ visible, toggleVisible, onChange, label, dateRanges, columnItems }) => {
	const datesToDisplay = dateRangesColumn(dateRanges, columnItems);
	return (
        <Popover
			visible={visible}
			trigger="click"
			content={
				<Row style={{ width: 300 }} gutter={[8, 8]}>
					{Object.keys(datesToDisplay).map((column) => (
						<Col key={column} md={12} span={12}>
							{Object.keys(get(datesToDisplay, column, {})).map(
								(rangeLabel, index) => (
									<Button
										key={rangeLabel}
										block
										style={{
											marginBottom: index !== columnItems - 1 ? 8 : 0,
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
			<Button style={{ marginLeft: 15 }} onClick={toggleVisible}>
				<ClockCircleOutlined />
				{label}
			</Button>
		</Popover>
    );
};

DateFilter.defaultProps = {
	visible: false,
	columnItems: 4,
	dateRanges: defaultDateRanges,
	label: '',
};

DateFilter.propTypes = {
	visible: PropTypes.bool,
	columnItems: PropTypes.number,
	dateRanges: PropTypes.object,
	label: PropTypes.string,
	toggleVisible: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default DateFilter;
