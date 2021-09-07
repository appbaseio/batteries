import React, { useRef } from 'react';
import { oneOf, string, object, element } from 'prop-types';

import { DiffEditor } from '@monaco-editor/react';

/* eslint-enable */
const MonacoDiffEditor = ({
	language,
	defaultValue,
	options,
	theme,
	height,
	width,
	loading,
	originalCode,
	modifiedCode,
}) => {
	const editorRef = useRef(null);

	const handleEditorDidMount = (editor) => {
		editorRef.current = editor;
	};

	return (
		<div key="diffEditor" style={{ width, height }}>
			<DiffEditor
				theme={theme}
				defaultValue={defaultValue}
				options={{
					...options,
				}}
				onMount={handleEditorDidMount}
				original={JSON.stringify(JSON.parse(originalCode), 0, 4)}
				modified={JSON.stringify(JSON.parse(modifiedCode), 0, 4)}
				language={language}
				height="100%"
				width="100%"
				loading={loading}
			/>
		</div>
	);
};

MonacoDiffEditor.defaultProps = {
	language: 'json',
	defaultValue: '',
	options: { readOnly: true },
	theme: 'light',
	height: '100%',
	width: '100%',
	loading: <h3>take a deep breath...</h3>,
	originalCode: '',
	modifiedCode: '',
};

MonacoDiffEditor.propTypes = {
	language: oneOf(['html', 'css', 'json', 'javascript']),
	theme: oneOf(['light', 'vs-dark', 'hc-dark']),
	defaultValue: string,
	options: object,
	height: string,
	width: string,
	loading: element,
	originalCode: string,
	modifiedCode: string,
};

export default MonacoDiffEditor;
