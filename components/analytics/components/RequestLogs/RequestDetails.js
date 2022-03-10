import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import get from 'lodash/get';
import { Button, Tabs, Icon, Popover, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Grid from '../../../shared/Grid';
import { getTimeDuration, replayRequest } from '../../utils';
import Flex from '../../../shared/Flex';
import { ruleStyle } from '../../../../../pages/SandboxPage/components/Result/styles';
import { isValidPlan } from '../../../../utils';
import { getRules } from '../../../../modules/actions';
import ActionView from '../../../../../pages/QueryRules/components/ActionView';
import RequestDiff from './RequestDiff';
// eslint-disable-next-line import/no-cycle
import ResponseDiff from './ResponseDiff';
import Container from '../../../../../components/Container';

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
			<Tabs css="margin-top: 30px" animated={false} defaultActiveKey="request">
				<TabPane tab="Request" key="request">
					<RequestDiff
						requestBody={request}
						url={url}
						headers={headers}
						method={method}
						requestChanges={requestChanges}
					/>
				</TabPane>
				<TabPane tab="Response" key="response">
					<ResponseDiff
						responseBody={responseBody}
						response={response}
						url={url}
						method={method}
						responseChanges={responseChanges}
					/>
				</TabPane>
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
	response: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array]).isRequired,
	responseChanges: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	requestChanges: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
	rules: PropTypes.array.isRequired,
	tier: PropTypes.string.isRequired,
	featureRules: PropTypes.bool.isRequired,
	fetchRules: PropTypes.func.isRequired,
	isLoading: PropTypes.bool,
	responseBody: PropTypes.string,
	latency: PropTypes.number,
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
