import React from 'react';
import { injectGlobal } from 'emotion';
import Joyride from 'react-joyride';
import { message, Button, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { CheckCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

/* eslint-disable-next-line */
injectGlobal`
  .__floater__body > div > div {
    text-align: left !important;
  }
`;

class Walkthrough extends React.Component {
	constructor(props) {
		super(props);

		const isTutorialCompleted = this.getTutorialStatus();
		this.state = {
			showTutorial: props.showTutorial || !isTutorialCompleted,
			tutorialCompleted: isTutorialCompleted,
			stepIndex: 0,
		};
	}

	componentDidUpdate(prevProps) {
		const { showTutorial } = this.props;
		if (showTutorial !== prevProps.showTutorial) {
			this.setState({
				showTutorial,
			});
		}
	}

	handleJoyrideSteps = data => {
		const { action, index, status, type } = data;
		const { showTutorial } = this.state;

		if (['finished', 'skipped'].includes(status) && showTutorial) {
			this.setState({
				showTutorial: false,
				tutorialCompleted: true,
				stepIndex: 0,
			});
			this.setTutorialStatus();
			message.success('Congrats! You have completed the Walkthrough.');
		} else if (type === 'step:after' || type === 'target:notFound') {
			this.setState({
				stepIndex: index + (action === 'prev' ? -1 : 1),
			});
		}
	};

	toggleTutorial = () => {
		this.setState(({ showTutorial }) => ({
			showTutorial: !showTutorial,
		}));
	};

	getTutorialStatus = () => {
		let tutorialData = localStorage.getItem('tutorialData');
		const { id } = this.props;
		if (tutorialData) {
			tutorialData = JSON.parse(tutorialData);
			if (!tutorialData[id]) {
				tutorialData[id] = false;
				localStorage.setItem(
					'tutorialData',
					JSON.stringify(tutorialData),
				);
			}
		} else {
			tutorialData = { [id]: false };
			localStorage.setItem('tutorialData', JSON.stringify(tutorialData));
		}
		return tutorialData[id];
	};

	setTutorialStatus = () => {
		const { id } = this.props;
		const tutorialData = localStorage.getItem('tutorialData');
		if (tutorialData) {
			const parsedTutorialData = JSON.parse(tutorialData);
			parsedTutorialData[id] = true;
			localStorage.setItem(
				'tutorialData',
				JSON.stringify(parsedTutorialData),
			);
		}
	};

	render() {
		const { showTutorial, tutorialCompleted, stepIndex } = this.state;
		const { showWalkthrough, joyrideSteps, hideButtons } = this.props;

		return showWalkthrough ? (
			<React.Fragment>
				{!hideButtons && (
					<div
						style={{
							position: 'fixed',
							bottom: '30px',
							right: '30px',
							display: 'inline',
							zIndex: 2,
						}}
					>
						<Tooltip
							placement="leftTop"
							title={
								tutorialCompleted
									? 'Walkthrough Completed'
									: 'Start Walkthrough'
							}
						>
							<Button
								onClick={this.toggleTutorial}
								shape="circle"
								type="primary"
								size="large"
								style={{
									background: '#40a9ff',
									color: 'white',
								}}
								icon={
									tutorialCompleted ? (
										<CheckCircleOutlined />
									) : (
										<PlayCircleOutlined />
									)
								}
							/>
						</Tooltip>
					</div>
				)}
				<Joyride
					run={showTutorial}
					steps={joyrideSteps}
					styles={{
						options: {
							overlayColor: 'rgba(0, 0, 0, 0.65)',
							primaryColor: '#1890ff',
							textColor: 'rgba(0, 0, 0, 0.85)',
						},
					}}
					continuous
					showProgress
					showSkipButton
					stepIndex={stepIndex}
					callback={this.handleJoyrideSteps}
				/>
			</React.Fragment>
		) : null;
	}
}

Walkthrough.propTypes = {
	hideButtons: PropTypes.bool,
	id: PropTypes.string.isRequired,
	showWalkthrough: PropTypes.bool,
	showTutorial: PropTypes.bool,
	joyrideSteps: PropTypes.array,
};

Walkthrough.defaultProps = {
	hideButtons: false,
	showWalkthrough: true,
	showTutorial: false,
	joyrideSteps: [],
};

export default Walkthrough;
