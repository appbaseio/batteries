import React, { useRef } from 'react';
import { oneOf, string, func, object, bool, element } from 'prop-types';

import Editor from '@monaco-editor/react';
import { css } from 'emotion';

const editorContainer = css`
	position: relative;

	button {
		position: absolute;
		top: 0px;
		right: 13px;
		width: fit-content;
		height: fit-content;
		background: none;
		padding: 5px 2px;
		color: rgb(117, 190, 255);
		text-decoration: underline;
		font-size: 12px;
		border: none;
		cursor: pointer;
		z-index: 2;
	}
`;

const tidyCode = (editor: any) => {
	if (editor) {
		editor.trigger('', 'editor.action.formatDocument');
	}
};

/* eslint-enable */
const Monaco = ({
	language,
	value,
	onChange,
	defaultValue,
	options,
	theme,
	height,
	width,
	readOnly,
	loading,
	onBlur,
}) => {
	const editorRef = useRef(null);

	const handleEditorDidMount = (editor) => {
		editorRef.current = editor;
		editor.onDidBlurEditorWidget(() => {
			if (typeof onBlur === 'function') {
				onBlur();
			}
		});

		setTimeout(() => {
			tidyCode(editor);
		}, 2000);
	};

	return (
		<div className={editorContainer} style={{ width, height }}>
			{!readOnly && (
				<button
					type="button"
					onClick={() => {
						tidyCode(editorRef.current);
					}}
				>
					Beautify
				</button>
			)}
			<Editor
				theme={theme}
				defaultValue={defaultValue}
				options={{
					...options,
					readOnly,
				}}
				onMount={handleEditorDidMount}
				language={language}
				value={value}
				onChange={onChange}
				height="100%"
				width="100%"
				loading={loading}
			/>
		</div>
	);
};

Monaco.defaultProps = {
	language: 'json',
	value: '',
	defaultValue: '',
	onChange: undefined,
	onBlur: () => {},
	options: {},
	theme: 'light',
	height: '100%',
	width: '100%',
	readOnly: false,
	loading: <h3>take a deep breath...</h3>,
};

Monaco.propTypes = {
	language: oneOf(['html', 'css', 'json', 'javascript']),
	theme: oneOf(['light', 'vs-dark', 'hc-dark']),
	value: string,
	defaultValue: string,
	onChange: func,
	onBlur: func,
	options: object,
	height: string,
	width: string,
	readOnly: bool,
	loading: element,
};

export default Monaco;
