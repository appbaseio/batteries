import React from 'react';
import { Drawer, Button, Icon, Collapse, Typography, Spin, Alert, List, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import { css } from 'emotion';

const { Panel } = Collapse;

const drawerStyle = css`
	.ant-drawer-header {
		background: #fafafa;
		padding: 18px 12px;
	}

	.drawer-dates {
		color: rgba(0, 0, 0, 0.45);
		font-size: 14px;
		margin-top: 5px;
	}

	.ant-drawer-body {
		background: #fafafa;
		padding: 0;
	}

	.ant-collapse {
		border-radius: 0;
	}

	.panel-header h6 {
		color: rgba(0, 0, 0, 0.85);
		font-weight: 600;
		margin: 0;
		font-size: 15px;
	}

	.panel-header p {
		color: rgba(0, 0, 0, 0.45);
		font-size: 14px;
		line-height: 18px;
		margin: 0;
		margin-top: 5px;
	}

	.recommendation-link {
		width: 100%;
		transition: all ease-in 0.2s;
	}

	.list-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.list-title .arrow {
		transform: translateX(-10px);
		opacity: 0;
		transition: all 0.2s ease-out;
	}

	.recommendation-link:hover {
		.ant-list-item-meta-title {
			color: #1890ff;
		}

		.list-title .arrow {
			transform: translateX(0px);
			opacity: 1;
		}
	}
`;

const dateRanges = ['19/04/2020', '23/04/2020'];

const insights = [
	{
		type: 'no_results',
		insight: {
			title: 'There are 10 no result searches',
			description: 'This is the most important issue for a search engine to avoid.',
			recommendations: [
				{
					title: 'Language Settings',
					description:
						"If you're using a specific language, make sure the language, stemming and stop words are configured in the Language menu.",
					short_link: '/analytics/popular-searches',
					long_link: '',
				},
				{
					title: 'Search Settings',
					description:
						'Make sure all the searchable fields and typo tolerance setting is set correctly.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Synonyms',
					description:
						'Set synonyms for search terms that are present in your index as different terms.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Query Rules',
					description: 'Create a query rule for the specific search terms.',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		type: 'low_clicks',
		insight: {
			title: 'Less than 10% of your searches have a click',
			description: 'Search Relevancy needs fixing.',
			recommendations: [
				{
					title: 'Language Settings',
					description:
						"If you're using a specific language, make sure the language, stemming and stop words are configured in the Language menu.",
					short_link: '',
					long_link: '',
				},
				{
					title: 'Search Settings',
					description:
						'Make sure all the searchable fields and typo tolerance setting is set correctly.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Synonyms',
					description:
						'Set synonyms for search terms that are present in your index as different terms.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Query Rules',
					description: 'Create a query rule for the specific search terms.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Query suggestions',
					description: '',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Tune Query suggestions',
					description: '',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		type: 'avg_click_position',
		insight: {
			title: 'The avg click position is high',
			description: 'Ranking is broken and needs fixing',
			recommendations: [
				{
					title: 'Search Settings',
					description:
						"Make sure the search fields' weights and the search typo tolerance setting is set correctly.",
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		type: 'popular_searches',
		insight: {
			title: "You're doing something right 👍",
			description: '',
			recommendations: [
				{
					title: 'Query Rules',
					description: 'Monetization / Feature opportunities → Query Rules',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		type: 'popular_searches_with_low_clicks',
		insight: {
			title: 'Lost Opportunities',
			description: '',
			recommendations: [
				{
					title: 'Improve UI/Ux',
					description:
						'This will be a doc link (or link to get [appbase.io](appbase.io) support plan)',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Language Settings',
					description:
						"If you're using a specific language, make sure the language, stemming and stop words are configured in the Language menu.",
					short_link: '',
					long_link: '',
				},
				{
					title: 'Search Settings',
					description:
						'Make sure all the searchable fields and typo tolerance setting is set correctly.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Synonyms',
					description:
						'Set synonyms for search terms that are present in your index as different terms.',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Query Rules',
					description: 'Create a query rule for the specific search terms.',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		type: 'long_tail_searches',
		insight: {
			title: 'Optimize Long Tail Searches',
			description: '',
			recommendations: [
				{
					title: 'Apply Query Rules',
					description:
						'Apply query rules to show the most relevant result to convert long-tail search queries.',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		type: 'bounce_rate',
		insight: {
			title: 'Improve your Search Ux',
			description: 'This awesome',
			recommendations: [
				{
					title: 'Look at UI/Ux',
					description: 'Look at UI/Ux ⇒ e.g. highlight results and improve Ux',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Use Hotjar',
					description: 'Install Hotjar with heatmaps',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		type: 'high_response_time',
		insight: {
			title: 'Your search response time is high',
			description: '',
			recommendations: [],
		},
	},
	{
		type: 'error_500',
		insight: {
			title: 'You got 10 500 requests.',
			description: '',
			recommendations: [
				{
					title: 'Look at improving availability',
					description: '',
					short_link: '',
					long_link: '',
				},
				{
					title: 'Upgrade search infra / resources',
					description: '',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
	{
		type: 'error_400',
		insight: {
			title: 'You got 10 400 or 401 requests.',
			description: '',
			recommendations: [
				{
					title: '400 ⇒ Check client-side issues',
					description: '',
					short_link: '',
					long_link: '',
				},
				{
					title: '401 ⇒ Check security',
					description: '',
					short_link: '',
					long_link: '',
				},
			],
		},
	},
];

class AnalyticsInsights extends React.Component {
	state = {
		isDrawerOpen: false,
	};

	handleDrawerOpen = () => {
		this.setState({
			isDrawerOpen: true,
		});

		// TODO:
		// Fetch insights data
		// Fetch only if insights is not present in redux
	};

	handleDrawerClose = () => {
		this.setState({
			isDrawerOpen: false,
		});
	};

	render() {
		const { isDrawerOpen } = this.state;

		return (
			<div>
				<Button onClick={this.handleDrawerOpen}>
					<Icon type="eye" />
					Actionable Insights
				</Button>
				<Drawer
					title={
						<React.Fragment>
							Actionable Insights
							<div className="drawer-dates">{`${dateRanges[0]} to ${dateRanges[1]}`}</div>
						</React.Fragment>
					}
					placement="right"
					closable={false}
					className={drawerStyle}
					onClose={this.handleDrawerClose}
					visible={isDrawerOpen}
					width="360"
				>
					<Collapse bordered={false} accordion>
						{insights.map((insight) => (
							<Panel
								showArrow={false}
								header={
									<div className="panel-header">
										<h6>{get(insight, 'insight.title')}</h6>
										{get(insight, 'insight.description') ? (
											<p>{get(insight, 'insight.description')}</p>
										) : null}
									</div>
								}
								className="panel"
								key={get(insight, 'insight.title')}
							>
								<List
									itemLayout="horizontal"
									locale={{
										emptyText: (
											<Alert
												message="No Recommendations Found"
												type="warning"
												showIcon
											/>
										),
									}}
									dataSource={get(insight, 'insight.recommendations', [])}
									renderItem={(recommendation) => (
										<List.Item>
											<Link
												className="recommendation-link"
												to={get(recommendation, 'short_link')}
											>
												<List.Item.Meta
													title={
														<div className="list-title">
															<span>
																{get(recommendation, 'title', '')}
															</span>
															<Icon
																className="arrow"
																type="arrow-right"
															/>
														</div>
													}
													description={get(recommendation, 'description')}
												/>
											</Link>
										</List.Item>
									)}
								/>
							</Panel>
						))}
					</Collapse>
				</Drawer>
			</div>
		);
	}
}

export default AnalyticsInsights;
