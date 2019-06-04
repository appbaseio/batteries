import React from 'react';
import { injectGlobal } from 'emotion';
import Joyride from 'react-joyride';
import { ACTIONS, EVENTS } from 'react-joyride/lib/constants';
import { message, Button, Tooltip } from 'antd';
import PropTypes from 'prop-types';

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
		if(showTutorial !==  prevProps.showTutorial) {
			this.setState({
				showTutorial,
			})
		}
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
		const { id } = this.props;
		if (tutorialData) {
			tutorialData = JSON.parse(tutorialData);
			if (!tutorialData[id]) {
				tutorialData[id] = false;
				localStorage.setItem('tutorialData', JSON.stringify(tutorialData));
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
			localStorage.setItem('tutorialData', JSON.stringify(parsedTutorialData));
		}
	};

	render() {
		const { showTutorial, tutorialCompleted, stepIndex } = this.state;

		const { showWalkthrough, joyrideSteps, hideButtons } = this.props;
		return showWalkthrough ? (
			<React.Fragment>
				{!hideButtons && <div
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
							type="primary"
							size="large"
							style={{ background: '#40a9ff', color: 'white' }}
							icon={tutorialCompleted ? 'check-circle' : 'play-circle'}
						/>
					</Tooltip>
				</div>}
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
