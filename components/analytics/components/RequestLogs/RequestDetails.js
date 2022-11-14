import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import get from 'lodash/get';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Tabs, Popover, Alert, Card } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import AceEditor from 'react-ace';
import Grid from '../../../shared/Grid';
import { getStringifiedJSON, getTimeDuration, replayRequest } from '../../utils';
import Flex from '../../../shared/Flex';
import { ruleStyle } from '../../../../../pages/SandboxPage/components/Result/styles';
import { isValidPlan } from '../../../../utils';
import { getRules } from '../../../../modules/actions';
import ActionView from '../../../../../pages/QueryRules/components/ActionView';
import RequestDiff from './RequestDiff';
// eslint-disable-next-line import/no-cycle
import ResponseDiff from './ResponseDiff';
import Container from '../../../../../components/Container';
import JsonView from '../../../../../components/JsonView';

const { TabPane } = Tabs;

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

const section = css`
	margin-bottom: 10px;
`;

const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const RequestDetails = ({
	time,
	method,
	url,
	ip,
	processingTime,
	status,
	headers,
	request,
	response,
	rules,
	tier,
	featureRules,
	fetchRules,
	isLoading,
	responseChanges,
	requestChanges,
	responseBody,
	latency,
	pipelineMode,
	context,
}) => {
	const [rulesData, setRulesData] = useState([]);
	const timeDuration = getTimeDuration(processingTime);

	useEffect(() => {
		if (isValidPlan(tier, featureRules)) {
			if (!rules) {
				fetchRules();
			}
		}
	}, []);

	useEffect(() => {
		if (!isLoading && rules && rules.length) {
			getRuleData(response.settings?.queryRules);
		}
	}, [rules]);

	function getRuleData(ruleIds) {
		if (ruleIds && ruleIds.length) {
			// fetch rule data for corresponding Ids
			setRulesData(rules.filter((rule) => ruleIds.includes(rule.id)));
		}
	}
	const responseHeaders = get(response, 'Headers', null) || get(response, 'headers', null) || {};
	return (
        <Container style={{ background: 'white' }}>
			<span css="font-weight: 500;color: black;font-size: 16px;">Log Details</span>
			<Grid label="Time" component={time} />
			<Grid label="Method" component={method.toUpperCase()} />
			<Grid label="URL" component={url} />
			<Grid label="IP" component={ip} />
			<Grid label="Response Code" component={status} />
			{latency !== -1 && <Grid label="Latency (in ms)" component={latency} />}
			{/* Banner for QueryRules */}
			{response.settings?.queryRules &&
				rulesData.map((rule) => (
					<Alert
						type="info"
						icon="info"
						style={{ margin: '16px 0px' }}
						message={
							<React.Fragment>
								<div className={ruleStyle}>
									<div>
										<div style={{ display: 'flex' }}>
											<p className="name">{rule.name}</p>
											<div style={{ marginLeft: 5 }}>
												<Link to={`/cluster/rules/${rule.id}`}>
													<Button type="primary" size="small" ghost>
														Edit Rule ↗
													</Button>
												</Link>
											</div>
										</div>
										<p className="expression">
											{rule.trigger && rule.trigger.expression}
										</p>
									</div>
									<div>
										{get(rule, 'actions', []).map((action) => (
											<div key={action.type} className={section}>
												<ActionView
													action={action}
													ruleId={rule.id || rule.name}
												/>
											</div>
										))}
									</div>
								</div>
							</React.Fragment>
						}
					/>
				))}
			<Flex css={buttonsContainer}>
				<Flex>
					<Popover
						content={<div css={popoverContent}>Replay this exact request again</div>}
						trigger="hover"
					>
						<Button onClick={() => replayRequest(url, method, headers, request)}>
							<ReloadOutlined />
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
			<Tabs css="margin-top: 30px" animated={false} defaultActiveKey="request">
				<TabPane tab={pipelineMode ? 'Stage Changes' : 'Request'} key="request">
					<RequestDiff
						requestBody={pipelineMode ? context : request}
						url={url}
						headers={headers}
						method={method}
						requestChanges={requestChanges}
						shouldDecode={!pipelineMode}
					/>
					{pipelineMode && (
						<Card
							title={
								<div style={{ display: 'flex' }}>
									<p style={{ fontWeight: 'bold', marginRight: 5 }}>Stage </p>
									<p>Final Response</p>
								</div>
							}
							style={{ marginBottom: 20 }}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<div>
									{method} {url}
								</div>
								{responseHeaders && (
									<div style={{ display: 'flex' }}>
										<div>Headers</div>
										<Popover
											content={
												<div css={popoverContent}>
													<JsonView json={responseHeaders} />
												</div>
											}
											trigger="click"
										>
											<div
												css={{
													cursor: 'pointer',
													margin: '0 7px',
													maxWidth: '95%',
													...overflow,
												}}
											>
												{` {...} `}
											</div>
										</Popover>
									</div>
								)}
							</div>
							<AceEditor
								value={getStringifiedJSON(responseBody)}
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
								minLines={1}
								maxLines={30}
								editorProps={{ $blockScrolling: true }}
							/>
						</Card>
					)}
				</TabPane>
				{!pipelineMode && (
					<TabPane tab="Response" key="response">
						<ResponseDiff
							responseBody={responseBody}
							response={response}
							url={url}
							method={method}
							responseChanges={responseChanges}
						/>
					</TabPane>
				)}
			</Tabs>
		</Container>
    );
};
RequestDetails.defaultProps = {
	ip: '_',
	responseBody: '',
	responseChanges: [],
	isLoading: false,
	latency: -1,
	pipelineMode: false,
	response: {},
	context: {},
};
RequestDetails.propTypes = {
	time: PropTypes.string.isRequired,
	method: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	ip: PropTypes.string,
	status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	processingTime: PropTypes.string.isRequired,
	headers: PropTypes.object.isRequired,
	request: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
	response: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array]),
	responseChanges: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	requestChanges: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
	rules: PropTypes.array.isRequired,
	tier: PropTypes.string.isRequired,
	featureRules: PropTypes.bool.isRequired,
	fetchRules: PropTypes.func.isRequired,
	isLoading: PropTypes.bool,
	responseBody: PropTypes.string,
	latency: PropTypes.number,
	pipelineMode: PropTypes.bool,
	context: PropTypes.object,
};

const mapStateToProps = (state) => ({
	rules: get(state, '$getAppRules.results') || [],
	isLoading: get(state, '$getAppRules.isFetching'),
	hasError: get(state, '$getAppRules.error'),
	tier: get(state, '$getAppPlan.results.tier'),
	featureRules: get(state, '$getAppPlan.results.feature_rules', false),
});

const mapDispatchToProps = (dispatch) => ({
	fetchRules: () => dispatch(getRules()),
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestDetails);
