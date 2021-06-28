import React, { Component } from 'react';
import { oneOf } from 'prop-types';
import { injectGlobal } from 'react-emotion';

const Editor = (props) => {
	if (typeof window !== 'undefined') {
		const AceEditor = require('react-ace').default; // eslint-disable-line
		require('brace').default; // eslint-disable-line
		switch (props.mode) {
			case 'html':
				require('brace/mode/html'); // eslint-disable-line
				break;
			case 'css':
				require('brace/mode/css'); // eslint-disable-line
				break;
			case 'javascript':
				require('brace/mode/javascript'); // eslint-disable-line
				break;
			default:
				require('brace/mode/json'); // eslint-disable-line
		}
		require('brace/theme/monokai'); // eslint-disable-line
		return <AceEditor {...props} />;
	}
	return null;
};

Editor.defaultProps = {
	mode: 'json',
};

Editor.propTypes = {
	mode: oneOf(['html', 'css', 'json', 'javascript']),
};

/* eslint-disable */
injectGlobal`
	.ace_editor,
	.ace_editor div,
	.ace_editor div span {
		font-family: monospace !important;
	}
`;

/* eslint-enable */
class Ace extends Component {
	state = {
		mounted: false,
	};

	componentDidMount() {
		// eslint-disable-next-line
		this.setState({ mounted: true });
	}

	render() {
		const { mounted } = this.state;
		return mounted ? <Editor {...this.props} editorProps={{ $blockScrolling: true }} /> : null;
	}
}

Ace.defaultProps = {
	mode: 'json',
};

Ace.propTypes = {
	mode: oneOf(['html', 'css', 'json', 'javascript']),
};

export default Ace;
