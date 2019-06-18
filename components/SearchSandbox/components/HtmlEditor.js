import React, { Component } from 'react';
import { injectGlobal } from 'react-emotion';

const Editor = props => {
    if (typeof window !== 'undefined') {
        const AceEditor = require('react-ace').default; // eslint-disable-line
        require('brace').default; // eslint-disable-line
        require('brace/mode/html'); // eslint-disable-line
        require('brace/theme/monokai'); // eslint-disable-line
        return <AceEditor theme="monokai" {...props} />;
    }
    return null;
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
class HtmlEditor extends Component {
    state = {
        mounted: false,
    };

    componentDidMount() {
        // eslint-disable-next-line
        this.setState({ mounted: true });
    }

    render() {
        const { mounted } = this.state;
        return mounted ? (
            <Editor {...this.props} editorProps={{ $blockScrolling: true }} />
        ) : null;
    }
}

export default HtmlEditor;
