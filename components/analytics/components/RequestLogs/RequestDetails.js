import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Modal, Button, Tabs } from 'antd';
import Grid from '../../../shared/Grid';
import { getTimeDuration } from '../../utils';

const { TabPane } = Tabs;

const modal = css`
	.ant-modal-content {
		width: 580px;
	}
`;
const tab = css`
	background-color: rgb(190, 245, 255, 0.1);
`;
const getData = (data) => {
	try {
		return JSON.stringify(data, null, 2);
	} catch (e) {
		return data;
	}
};
const RequestDetails = ({
	show,
	handleCancel,
	time,
	method,
	url,
	ip,
	processingTime,
	status,
	headers,
	request,
	response,
}) => {
	const timeDuration = getTimeDuration(processingTime);
	return (
		<Modal
			style={{
				width: '600px',
			}}
			css={modal}
			footer={[
				<Button key="back" onClick={handleCancel}>
					Cancel
				</Button>,
			]}
			visible={show}
			onCancel={handleCancel}
		>
			<span css="font-weight: 500;color: black;font-size: 16px;">Log Details</span>
			<Grid label="Time" component={time} />
			<Grid label="Method" component={method.toUpperCase()} />
			<Grid label="URL" component={url} />
			<Grid label="IP" component={ip} />
			<Grid label="Response Code" component={status} />
			{processingTime && (
				<Grid
					label="Processing Time"
					component={`${timeDuration.time} ${timeDuration.formattedUnit}`}
				/>
			)}
			<Tabs css="margin-top: 30px" animated={false} defaultActiveKey="response">
				<TabPane tab="Response" key="response">
					<pre css={tab}>{getData(response)}</pre>
				</TabPane>
				<TabPane tab="Request" key="request">
					{/* <p css={tab}>{request}</p> */}
					{/* <pre css={tab}>{JSON.stringify(request, null, 2)}</pre> */}
					<pre css={tab}>{getData(request)}</pre>
				</TabPane>
				<TabPane tab="Headers" key="headers">
					<pre css={tab}>{getData(headers)}</pre>
				</TabPane>
			</Tabs>
		</Modal>
	);
};
RequestDetails.defaultProps = {
	show: false,
	handleCancel: () => null,
};
RequestDetails.propTypes = {
	show: PropTypes.bool,
	handleCancel: PropTypes.func,
	time: PropTypes.string.isRequired,
	method: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	ip: PropTypes.string.isRequired,
	status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	processingTime: PropTypes.string.isRequired,
	headers: PropTypes.object.isRequired,
	request: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
	response: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array]).isRequired,
};

export default RequestDetails;
