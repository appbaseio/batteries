import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import { Card, Popover, Icon, Button } from 'antd';
import DiffMatchPatch from 'diff-match-patch';
import { getStringifiedJSON, convertToCURL } from '../../utils';
import AceEditor from '../../../SearchSandbox/containers/AceEditor';
import JsonView from '../../../../../components/JsonView';

const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 300px;
	max-height: 300px;
`;

const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const RequestDiff = ({ requestBody, requestChanges, method, headers, url, shouldDecode }) => {
	const decodeRequestChange = (decodedData, originalData) => {
		if (decodedData && originalData) {
			const dmp = new DiffMatchPatch();
			try {
				const delta = decodedData;
				const [text2] = dmp.patch_apply(
					dmp.patch_make(originalData, dmp.diff_fromDelta(originalData, unescape(delta))),
					originalData,
				);
				return text2;
			} catch (er) {
				try {
					const delta = decodedData.replace(/^=\d+/g, `=${originalData.length}`);
					const [text2] = dmp.patch_apply(
						dmp.patch_make(
							originalData,
							dmp.diff_fromDelta(originalData, unescape(delta)),
						),
						originalData,
					);
					return text2;
				} catch (err) {
					try {
						const delta = decodedData.replace(/^=.+\t/g, `=${originalData.length}`);

						const [text2] = dmp.patch_apply(
							dmp.patch_make(
								originalData,
								dmp.diff_fromDelta(originalData, unescape(delta)),
							),
							originalData,
						);
						return text2;
					} catch (error) {
						console.error(error);
						return '';
					}
				}
			}
		}
		return '';
	};

	const IsJsonString = (str) => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	};

	const capitalizeFirstLetter = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	let request =
		requestBody && typeof requestBody === 'object' ? JSON.stringify(requestBody) : requestBody;

	return (
		<div>
			<Card
				title={
					<div style={{ display: 'flex' }}>
						<p style={{ fontWeight: 'bold', marginRight: 5 }}>Stage </p>
						<p>Original Request</p>
					</div>
				}
				style={{ marginBottom: 20 }}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<div>
						{method} {url}
					</div>
					{headers && (
						<div style={{ display: 'flex' }}>
							<div>Headers</div>
							<Popover
								content={
									<div css={popoverContent}>
										<JsonView json={headers} />
									</div>
								}
								trigger="click"
							>
								<div
									css={{
										cursor: 'pointer',
										margin: '0 7px',
										maxWidth: '95%',
										...overflow,
									}}
								>
									{` {...} `}
								</div>
							</Popover>
						</div>
					)}
					<Popover content="Copy cURL request to clipboard" trigger="hover">
						<Button onClick={() => convertToCURL(url, method, headers, requestBody)}>
							<Icon type="copy" />
							Copy as cURL
						</Button>
					</Popover>
				</div>
				<AceEditor
					mode="json"
					value={getStringifiedJSON(requestBody)}
					theme="textmate"
					readOnly
					name="query-request"
					fontSize={14}
					showPrintMargin={false}
					style={{
						width: '100%',
						borderRadius: 4,
						border: '1px solid rgba(0,0,0,0.15)',
						margin: '12px 0',
					}}
					showGutter
					setOptions={{
						showLineNumbers: false,
						tabSize: 4,
					}}
					minLines={1}
					maxLines={30}
					editorProps={{ $blockScrolling: true }}
				/>
			</Card>
			{requestChanges
				.filter((i) => i.stage !== 'searchrelevancy')
				.map((requestChange, index) => {
					const requestChangeBody = requestChange.body || requestChange.context;

					if (shouldDecode) {
						request = decodeRequestChange(requestChangeBody, request);
					} else if (!shouldDecode) {
						if (typeof requestChange === 'object') {
							request = JSON.stringify(requestChange.context);
						} else {
							request = requestChange.context;
						}
					}
					return (
						<Card
							// eslint-disable-next-line react/no-array-index-key
							key={String(request) + index}
							title={
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<div style={{ display: 'flex' }}>
										<div style={{ fontWeight: 'bold', marginRight: 5 }}>
											Stage{' '}
										</div>
										<div>
											{capitalizeFirstLetter(
												requestChange.stage || requestChange.id,
											)}
										</div>
									</div>
									<div>Took {requestChange.took}ms</div>
								</div>
							}
							style={{ marginBottom: 20 }}
						>
							<AceEditor
								mode={IsJsonString(request) ? 'json' : 'text'}
								value={
									IsJsonString(request)
										? JSON.stringify(JSON.parse(request), null, 2)
										: request
								}
								theme="textmate"
								readOnly
								name="query-request"
								fontSize={14}
								showPrintMargin={false}
								style={{
									width: '100%',
									borderRadius: 4,
									border: '1px solid rgba(0,0,0,0.15)',
									margin: '12px 0',
								}}
								showGutter
								setOptions={{
									showLineNumbers: false,
									tabSize: 4,
								}}
								minLines={1}
								maxLines={30}
								editorProps={{ $blockScrolling: true }}
							/>
						</Card>
					);
				})}
		</div>
	);
};

RequestDiff.defaultProps = {
	requestChanges: [],
	requestBody: {},
	method: '',
	url: '',
	headers: {},
	shouldDecode: true,
};
RequestDiff.propTypes = {
	requestChanges: PropTypes.array,
	requestBody: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
	method: PropTypes.string,
	headers: PropTypes.object,
	url: PropTypes.string,
	shouldDecode: PropTypes.bool,
};

export default RequestDiff;
