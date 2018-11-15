import React from 'react';
import { injectGlobal } from 'emotion';
import Joyride from 'react-joyride';
import { message, Button, Tooltip } from 'antd';
import { ACTIONS, EVENTS } from 'react-joyride/es/constants';
import PropTypes from 'prop-types';

import joyrideSteps from '../../utils/joyrideSteps';

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
			showTutorial: false,
			tutorialCompleted: isTutorialCompleted,
			stepIndex: 0,
		};
	}

	handleJoyrideSteps = ({ action, index, type }) => {
		const { showTutorial } = this.state;
		if (type === EVENTS.TOUR_END && showTutorial) {
			this.setState({
				showTutorial: false,
				tutorialCompleted: true,
				stepIndex: 0,
			});
			this.setTutorialStatus();
			message.success('Congrats! You have completed the Walkthrough.');
		} else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
			this.setState({
				stepIndex: index + (action === ACTIONS.PREV ? -1 : 1),
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
		const { component } = this.props;
		if (tutorialData) {
			tutorialData = JSON.parse(tutorialData);
		} else {
			tutorialData = {
				SearchPreview: false,
				Mappings: false,
				Analytics: false,
			};
			localStorage.setItem('tutorialData', JSON.stringify(tutorialData));
		}
		return tutorialData[component];
	};

	setTutorialStatus = () => {
		const { component } = this.props;
		const tutorialData = localStorage.getItem('tutorialData');
		if (tutorialData) {
			const parsedTutorialData = JSON.parse(tutorialData);
			parsedTutorialData[component] = true;
			localStorage.setItem('tutorialData', JSON.stringify(parsedTutorialData));
		}
	};

	render() {
		const { showTutorial, tutorialCompleted, stepIndex } = this.state;

		const { component, showWalkthrough } = this.props;
		return showWalkthrough ? (
			<React.Fragment>
				<div
					style={{
						position: 'fixed',
						bottom: '15px',
						right: '65px',
						display: 'inline',
						zIndex: 2,
					}}
				>
					<Tooltip
						placement="leftTop"
						title={tutorialCompleted ? 'Walkthrough Completed' : 'Start Walkthrough'}
					>
						<Button
							onClick={this.toggleTutorial}
							shape="circle"
							type="dashed"
							size="large"
							icon={tutorialCompleted ? 'check-circle' : 'play-circle'}
						/>
					</Tooltip>
				</div>
				<Joyride
					run={showTutorial}
					steps={joyrideSteps(component)}
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
	component: PropTypes.string.isRequired,
	showWalkthrough: PropTypes.bool,
};

Walkthrough.defaultProps = {
	showWalkthrough: true,
};

export default Walkthrough;
