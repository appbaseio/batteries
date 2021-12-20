import React, { useEffect, useRef } from 'react';
import { oneOf, string, func, object, bool, element } from 'prop-types';

import Editor, { useMonaco } from '@monaco-editor/react';
import { css } from 'emotion';
/* eslint-disable */

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
	customizeMonacoInstance,
	wrapperClass,
}) => {
	const editorRef = useRef(null);
	const monaco = useMonaco();

	useEffect(() => {
		// or make sure that it exists by other ways
		if (monaco) {
			// custom formatter for javascript
			// source: https://titanwolf.org/Network/Articles/Article?AID=552978cd-21c5-4f1d-ade1-f52439200ef8
			if (language === 'javascript') {
				monaco.languages.registerDocumentFormattingEditProvider('javascript', {
					async provideDocumentFormattingEdits(model) {
						/* eslint-disable import/no-extraneous-dependencies */
						const prettier = await import('prettier');
						const babylon = await import('prettier/parser-babel');
						const text = prettier.format(model.getValue(), {
							parser: 'babel',

							plugins: [babylon],

							singleQuote: true,
							tabWidth: 4,
						});
						/* eslint-enable import/no-extraneous-dependencies */
						return [
							{
								range: model.getFullModelRange(),

								text,
							},
						];
					},
				});
			}
			if (typeof customizeMonacoInstance === 'function') {
				customizeMonacoInstance(monaco, editorRef?.current);
			}
		}
	}, [monaco]);

	const handleEditorDidMount = (editor) => {
		editorRef.current = editor;
		editor.onDidBlurEditorWidget(() => {
			if (typeof onBlur === 'function') {
				onBlur();
			}
		});

		setTimeout(() => {
			tidyCode(editor);
		}, 1000);
	};

	return (
		<div css={editorContainer} className={wrapperClass} style={{ width, height }}>
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
	customizeMonacoInstance: undefined,
	wrapperClass: '',
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
	customizeMonacoInstance: func,
	wrapperClass: string,
};

export default Monaco;
