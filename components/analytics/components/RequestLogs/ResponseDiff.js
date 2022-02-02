import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import { Card, Popover, Icon } from 'antd';
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
    response,
    responseChanges,
    method,
    headers,
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
            try {
                var dmp = new diff_match_patch();
                const delta = decodedData.replace(/^=\d+/g, `=${text1.length}`)
                const diffs = dmp.diff_fromDelta(text1, delta);
                diffs.forEach((diff) => {
                    diff[0] = inverseOp(diff[0]);
                });

                const patches = dmp.patch_make(text1, diffs);
                const [text2, results] = dmp.patch_apply(patches, text1);
                return JSON.stringify(JSON.parse(text2), null, 2);
            } catch(err) {
                console.error(err);
            }
        }
       return '';
    }
    // const decodeResponseChange = (decodedData, originalData) => {
    //     if(decodedData && originalData) {
    //         var dmp = new diff_match_patch();
    //         const delta = decodedData.replace(/^=.+\t/g, `=${originalData.length}\t`);
    //         const [text2, results] = dmp.patch_apply(
    //             dmp.patch_make(originalData, dmp.diff_fromDelta(originalData, unescape(delta))),
    //             originalData
    //         );
    //         return JSON.stringify(JSON.parse(text2), null, 2);
    //     }
    //    return '';
    // }

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
                    // value=''
                    value={getStringifiedJSON(response)}
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
            {responseChanges.filter(i => i.stage !== 'searchrelevancy').map((responseChange) => {
                const value = decodeResponseChange(responseChange.body, responseBody);
                console.log(value);
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
                            value={value}
                            value=''
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
