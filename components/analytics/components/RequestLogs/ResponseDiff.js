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

const ResponseDiff = ({
    responseBody,
    responseChanges,
    method,
    headers,
    url
}) => {
    const decodeResponseChange = (decodedData, originalData) => {
        if(decodedData && originalData) {
            var dmp = new diff_match_patch();
            const delta = decodedData.replace(/^=.+\t/g, `=${originalData.length}\t`);
            const [text2, results] = dmp.patch_apply(
                dmp.patch_make(originalData, dmp.diff_fromDelta(originalData, unescape(delta))),
                originalData
            );
            return text2;
        }
       return '';
    }

    return (
        <div>
            <Card title="Stage: Original response" style={{marginBottom: 20}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>{method}{': '}{url}</div>
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
                    <Popover
                        content='Copy cURL request to clipboard'
                        trigger="hover"
                    >
                        <Icon
                            type="copy"
                            onClick={() => convertToCURL(url, method, headers, responseChange.body)}
                        />
                    </Popover>
                </div>
                <AceEditor
                    mode="json"
                    value={getStringifiedJSON(responseBody)}
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
                    editorProps={{ $blockScrolling: true }}
                />
            </Card>
            {responseChanges?.slice(1).map((responseChange) => {
                console.log(responseChange);
                return (
                    <Card title={`Stage: ${responseChange.stage}`} style={{marginBottom: 20}} extra={<div>Took {responseChange.took}ms</div>}>
                        <Popover
                            content='Copy cURL request to clipboard'
                            trigger="hover"
                        >
                            <Icon
                                type="copy"
                                style={{ marginLeft: '100%', marginBottom: '20px' }}
                                onClick={() => convertToCURL(url, method, headers, responseChange.body)}
                            />
                        </Popover>
                        <AceEditor
                            mode="json"
                            value={decodeResponseChange(responseChange.body, JSON.stringify(responseBody))}
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
                )
            })}
        </div>
    );
}

export default ResponseDiff;
