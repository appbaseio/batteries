import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import { Card, Popover, Icon } from 'antd';
import ReactDiffViewer from 'react-diff-viewer';
import { getStringifiedJSON } from '../../utils';
import AceEditor from '../../../SearchSandbox/containers/AceEditor';
import diff_match_patch from "diff-match-patch";
import JsonView from '../../../../../components/JsonView';
import { convertToCURL } from '../../utils';

const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 300px;
	max-height: 300px;
`;

const overflow = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const RequestDiff = ({
    requestBody,
    requestChanges,
    method,
    headers,
    url
}) => {
    const decodeRequestChange = (delta, text1) => {
        if(delta && text1) {
            var dmp = new diff_match_patch();
            const diffs = dmp.diff_fromDelta(text1, delta);           
            const patches = dmp.patch_make(text1, diffs);
            const [text2, results] = dmp.patch_apply(patches, text1);
            return text2;
        }
       return '';
    }

    return (
        <div>
            <Card title="Stage: Original Request" style={{marginBottom: 20}}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                        <div>{method}</div>
                        <div>{url}</div>
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
                    editorProps={{ $blockScrolling: true }}
                />
            </Card>
            {
                requestChanges.map((requestChange) => {
                    return (
                        <Card title={`Stage: ${requestChange.stage}`} style={{marginBottom: 20}} extra={<div>Took {requestChange.took}ms</div>}>
                            <Icon
                                type="copy"
                                onClick={() => convertToCURL(url, method, headers, requestChange.body)}
                            />
                            <ReactDiffViewer
                                oldValue={JSON.stringify(requestBody, null, 2)}
                                newValue={decodeRequestChange(requestChange.body, JSON.stringify(requestBody, null, 2))}
                                splitView
                                hideLineNumbers={false}
                                showDiffOnly={false}
                                leftTitle="Old Value"
                                rightTitle="New Value"
                                styles={{
                                    content: {
                                        fontSize: '10px',
                                    },
                                    gutter: {
                                        padding: '0px',
                                    },
                                }}
                            />
                        </Card>
                    )
                })
            }
        </div>
    );
}

export default RequestDiff;
