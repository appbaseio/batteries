import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { Modal, Button, Tabs, Icon, Popover } from 'antd';
import Grid from '../../../shared/Grid';
import { getTimeDuration, getStringifiedJSON, convertToCURL, replayRequest } from '../../utils';
import Flex from '../../../shared/Flex';
import AceEditor from '../../../SearchSandbox/containers/AceEditor';

const { TabPane } = Tabs;

const modal = css`
	.ant-modal-content {
		width: 580px;
	}
`;
const buttonsContainer = css`
	margin-top: 30px;
	justify-content: flex-end;
`;
const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 250px;
	max-height: 250px;
`;
const button = css`
	margin-right: 20px;
`;

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
			<Flex css={buttonsContainer}>
				<Flex css={button}>
					<Popover
						content={<div css={popoverContent}>Copy cURL request to clipboard</div>}
						trigger="hover"
					>
						<Button onClick={() => convertToCURL(url, method, headers, request)}>
							<Icon type="copy" />
							Copy as cURL
						</Button>
					</Popover>
				</Flex>
				<Flex>
					<Popover
						content={<div css={popoverContent}>Replay this exact request again</div>}
						trigger="hover"
					>
						<Button onClick={() => replayRequest(url, method, headers, request)}>
							<Icon type="reload" />
							Replay Request
						</Button>
					</Popover>
				</Flex>
			</Flex>
			{processingTime && (
				<Grid
					label="Processing Time"
					component={`${timeDuration.time} ${timeDuration.formattedUnit}`}
				/>
			)}
			<Tabs css="margin-top: 30px" animated={false} defaultActiveKey="response">
				<TabPane tab="Response" key="response">
					<AceEditor
						mode="json"
						value={getStringifiedJSON(response)}
						theme="textmate"
						readOnly
						name="query-response"
						fontSize={14}
						showPrintMargin={false}
						style={{
							width: '100%',
							borderRadius: 4,
							border: '1px solid rgba(0,0,0,0.15)',
							margin: '12px 0',
						}}
						showGutter
						setOptions={{
							showLineNumbers: false,
							tabSize: 4,
						}}
						editorProps={{ $blockScrolling: true }}
					/>
				</TabPane>
				<TabPane tab="Request" key="request">
					<AceEditor
						mode="json"
						value={getStringifiedJSON(request)}
						theme="textmate"
						readOnly
						name="query-request"
						fontSize={14}
						showPrintMargin={false}
						style={{
							width: '100%',
							borderRadius: 4,
							border: '1px solid rgba(0,0,0,0.15)',
							margin: '12px 0',
						}}
						showGutter
						setOptions={{
							showLineNumbers: false,
							tabSize: 4,
						}}
						editorProps={{ $blockScrolling: true }}
					/>
				</TabPane>
				<TabPane tab="Headers" key="headers">
					<AceEditor
						mode="json"
						value={getStringifiedJSON(headers)}
						theme="textmate"
						readOnly
						name="query-headers"
						fontSize={14}
						showPrintMargin={false}
						style={{
							width: '100%',
							borderRadius: 4,
							border: '1px solid rgba(0,0,0,0.15)',
							margin: '12px 0',
						}}
						showGutter
						setOptions={{
							showLineNumbers: false,
							tabSize: 4,
						}}
						editorProps={{ $blockScrolling: true }}
					/>
				</TabPane>
			</Tabs>
		</Modal>
	);
};
RequestDetails.defaultProps = {
	ip: '_',
	show: false,
	handleCancel: () => null,
};
RequestDetails.propTypes = {
	show: PropTypes.bool,
	handleCancel: PropTypes.func,
	time: PropTypes.string.isRequired,
	method: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	ip: PropTypes.string,
	status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	processingTime: PropTypes.string.isRequired,
	headers: PropTypes.object.isRequired,
	request: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
	response: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array]).isRequired,
};

export default RequestDetails;
