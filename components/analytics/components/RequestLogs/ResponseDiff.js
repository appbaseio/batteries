/* eslint-disable no-param-reassign */
import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Card, Popover } from 'antd';
import DiffMatchPatch from 'diff-match-patch';
import { getStringifiedJSON } from '../../utils';
import AceEditor from '../../../SearchSandbox/containers/AceEditor';
import JsonView from '../../../../../components/JsonView';
import { parseData } from '.';

const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 300px;
	max-height: 300px;
`;

const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const ResponseDiff = ({ responseBody, response, responseChanges, method, url }) => {
	const inverseOp = (currentOp) => {
		switch (currentOp) {
			case DiffMatchPatch.DIFF_DELETE:
				return DiffMatchPatch.DIFF_INSERT;
			case DiffMatchPatch.DIFF_INSERT:
				return DiffMatchPatch.DIFF_DELETE;
			default:
				return currentOp;
		}
	};

	const decodeResponseChange = (decodedData, text1) => {
		if (decodedData && text1) {
			const dmp = new DiffMatchPatch();
			try {
				const delta = decodedData;
				const diffs = dmp.diff_fromDelta(text1, delta);
				diffs.forEach((diff) => {
					diff[0] = inverseOp(diff[0]);
				});

				const patches = dmp.patch_make(text1, diffs);
				const [text2] = dmp.patch_apply(patches, text1);
				return JSON.stringify(JSON.parse(text2), null, 2);
			} catch (er) {
				try {
					const delta = decodedData.replace(/^=\d+/g, `=${text1.length}`);
					const diffs = dmp.diff_fromDelta(text1, delta);
					diffs.forEach((diff) => {
						diff[0] = inverseOp(diff[0]);
					});

					const patches = dmp.patch_make(text1, diffs);
					const [text2] = dmp.patch_apply(patches, text1);
					return JSON.stringify(JSON.parse(text2), null, 2);
				} catch (err) {
					try {
						const delta = decodedData.replace(/^=.+\t/g, `=${text1.length}`);
						const diffs = dmp.diff_fromDelta(text1, delta);
						diffs.forEach((diff) => {
							diff[0] = inverseOp(diff[0]);
						});

						const patches = dmp.patch_make(text1, diffs);
						const [text2] = dmp.patch_apply(patches, text1);
						return JSON.stringify(JSON.parse(text2), null, 2);
					} catch (error) {
						console.error(error);
						return '';
					}
				}
			}
		}
		return '';
	};

	const capitalizeFirstLetter = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	const headers = get(response, 'Headers', null) || get(response, 'headers', null) || {};
	return (
		<div>
			<Card
				title={
					<div style={{ display: 'flex' }}>
						<p style={{ fontWeight: 'bold', marginRight: 5 }}>Stage </p>
						<p>Final Response</p>
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
				</div>
				<AceEditor
					mode="json"
					value={getStringifiedJSON(parseData(get(response, 'body', {})))}
					theme="textmate"
					readOnly
					name="query-response"
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
				/>
			</Card>
			{responseChanges
				.filter((i) => i.stage !== 'searchrelevancy')
				.map((responseChange) => {
					const value = decodeResponseChange(responseChange.body, responseBody);

					return (
						<Card
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
										<div>{capitalizeFirstLetter(responseChange.stage)}</div>
									</div>
									<div>Took {responseChange.took}ms</div>
								</div>
							}
							style={{ marginBottom: 20 }}
						>
							<AceEditor
								mode="json"
								value={value}
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
ResponseDiff.defaultProps = {
	responseChanges: [],
	responseBody: {},
	method: '',
	url: '',
	response: {},
};
ResponseDiff.propTypes = {
	responseChanges: PropTypes.array,
	responseBody: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
	method: PropTypes.string,
	response: PropTypes.object,
	url: PropTypes.string,
};
export default ResponseDiff;
import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Card, Popover, Icon } from 'antd';
import { getStringifiedJSON } from '../../utils';
import AceEditor from '../../../SearchSandbox/containers/AceEditor';
import diff_match_patch from "diff-match-patch";
import JsonView from '../../../../../components/JsonView';
import { convertToCURL } from '../../utils';
import { parseData } from '.';

const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 300px;
	max-height: 300px;
`;

const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const ResponseDiff = ({
    responseBody,
    response,
    responseChanges,
    method,
    url
}) => {
    const inverseOp = (currentOp) => {
        switch (currentOp) {
            case diff_match_patch.DIFF_DELETE:
                return diff_match_patch.DIFF_INSERT;
            case diff_match_patch.DIFF_INSERT:
                return diff_match_patch.DIFF_DELETE;
            default:
                return currentOp;
        }
    }

    const decodeResponseChange = (decodedData, text1) => {
        if(decodedData && text1) {
            var dmp = new diff_match_patch();
            try {
                const delta = decodedData
                const diffs = dmp.diff_fromDelta(text1, delta);
                diffs.forEach((diff) => {
                    diff[0] = inverseOp(diff[0]);
                });

                const patches = dmp.patch_make(text1, diffs);
                const [text2, results] = dmp.patch_apply(patches, text1);
                return JSON.stringify(JSON.parse(text2), null, 2);
            } catch(err) {
                try {
                    const delta = decodedData.replace(/^=\d+/g, `=${text1.length}`)
                    const diffs = dmp.diff_fromDelta(text1, delta);
                    diffs.forEach((diff) => {
                        diff[0] = inverseOp(diff[0]);
                    });

                    const patches = dmp.patch_make(text1, diffs);
                    const [text2, results] = dmp.patch_apply(patches, text1);
                    return JSON.stringify(JSON.parse(text2), null, 2);
                } catch(err) {
                    try {
                        const delta = decodedData.replace(/^=.+\t/g, `=${text1.length}`)
                        const diffs = dmp.diff_fromDelta(text1, delta);
                        diffs.forEach((diff) => {
                            diff[0] = inverseOp(diff[0]);
                        });

                        const patches = dmp.patch_make(text1, diffs);
                        const [text2, results] = dmp.patch_apply(patches, text1);
                        return JSON.stringify(JSON.parse(text2), null, 2);
                    } catch(err) {
                        console.error(err);
                        return '';
                    }
                }
            }
        }
       return '';
    }

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const headers = get(response, 'Headers', {});
    return (
        <div>
            <Card
                title={<div style={{ display: 'flex'}}><p style={{ fontWeight: 'bold', marginRight: 5 }}>Stage {' '}</p><p>Final Response</p></div>}
                style={{marginBottom: 20}}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>{method}{' '}{url}</div>
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
                </div>
                <AceEditor
                    mode="json"
                    value={getStringifiedJSON(parseData(get(response, 'body', {})))}
                    theme="textmate"
                    readOnly
                    name="query-response"
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
                />
            </Card>
            {responseChanges.filter(i => i.stage !== 'searchrelevancy').map((responseChange) => {
                const value = decodeResponseChange(responseChange.body, responseBody);

                return (
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <div style={{ display: 'flex'}}>
                                    <div style={{ fontWeight: 'bold', marginRight: 5 }}>Stage {' '}</div>
                                    <div>{capitalizeFirstLetter(responseChange.stage)}</div>
                                </div>
                                <div>Took {responseChange.took}ms</div>
                            </div>
                        }
                        style={{marginBottom: 20}}
                    >
                        <AceEditor
                            mode="json"
                            value={value}
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
                )
            })}
        </div>
    );
}

export default ResponseDiff;
