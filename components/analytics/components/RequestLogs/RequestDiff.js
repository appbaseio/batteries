import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import { Card, Popover, Icon, Button } from 'antd';
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
    const decodeRequestChange = (decodedData, originalData) => {
        if(decodedData && originalData) {
            var dmp = new diff_match_patch();
            try {
                const delta = decodedData;
                const [text2, results] = dmp.patch_apply(
                    dmp.patch_make(originalData, dmp.diff_fromDelta(originalData, unescape(delta))),
                    originalData
                );
                return text2;
            } catch(err) {
                try {
                    const delta = decodedData.replace(/^=\d+/g, `=${originalData.length}`);
                    const [text2, results] = dmp.patch_apply(
                        dmp.patch_make(originalData, dmp.diff_fromDelta(originalData, unescape(delta))),
                        originalData
                    );
                    return text2;
                } catch(err) {
                    try {
                        const delta = decodedData.replace(/^=.+\t/g, `=${originalData.length}`);
                        const [text2, results] = dmp.patch_apply(
                            dmp.patch_make(originalData, dmp.diff_fromDelta(originalData, unescape(delta))),
                            originalData
                        );
                        return text2;
                    } catch(err) {
                        console.error(err);
                        return '';
                    }
                }
            }
        }
       return '';
    }

    const IsJsonString = (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    let request = JSON.stringify(requestBody);
    return (
        <div>
            <Card
                title={<div style={{ display: 'flex'}}><p style={{ fontWeight: 'bold', marginRight: 5 }}>Stage {' '}</p><p>Original request</p></div>}
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
                    <Popover
                        content='Copy cURL request to clipboard'
                        trigger="hover"
                    >
                        <Button
                            onClick={() => convertToCURL(url, method, headers, requestBody)}
                        >
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
                    editorProps={{ $blockScrolling: true }}
                />
            </Card>
            {requestChanges.filter(i => i.stage !== 'searchrelevancy').map((requestChange) => {
                request = decodeRequestChange(requestChange.body, request);
                return (
                    <Card
                        title={
                            <div style={{ display: 'flex'}}>
                                <p style={{ fontWeight: 'bold', marginRight: 5 }}>Stage {' '}</p>
                                <p>{requestChange.stage}</p>
                                <Button
                                    style={{ marginLeft: '20px'}}
                                    onClick={() => convertToCURL(url, method, headers, IsJsonString(request) ? JSON.parse(request) : request)}
                                >
                                    <Icon type="copy" />
                                    Copy as cURL
                                </Button>
                            </div>
                        }
                        style={{marginBottom: 20}}
                        extra={<div>Took {requestChange.took}ms</div>}
                    >
                        {IsJsonString(request) ? (
                            <AceEditor
                                mode="json"
                                value={IsJsonString(request) ? JSON.stringify(JSON.parse(request), null, 2) : request}
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
                        ) : (
                            <ReactDiffViewer
                                oldValue=''
                                newValue={request}
                                splitView={false}
                                hideLineNumbers
                                showDiffOnly={false}
                                leftTitle={undefined}
                                rightTitle={undefined}
                                styles={{
                                    content: {
                                        fontSize: '10px',
                                    },
                                    gutter: {
                                        padding: '0px',
                                    },
                                }}
                            />
                        )}

                    </Card>
                )
            })}
        </div>
    );
}

export default RequestDiff;
