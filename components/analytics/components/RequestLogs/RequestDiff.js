import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import ReactDiffViewer from 'react-diff-viewer';
import { getStringifiedJSON } from '../../utils';
import AceEditor from '../../../SearchSandbox/containers/AceEditor';
import diff_match_patch from "diff-match-patch";

const RequestDiff = ({response, responseChanges}) => {

    const decodeResponseChange = (decodedData, originalData) => {
        if(decodedData && originalData) {
            var dmp = new diff_match_patch();
            const delta = decodedData.replace(/^=.+\t/g, `=${originalData.length}\t`);
            const [text2, results] = dmp.patch_apply(
                dmp.patch_make(originalData, dmp.diff_fromDelta(originalData, unescape(delta))),
                originalData
            );
            return JSON.parse(JSON.stringify(text2, null, 2));
        }
       return '';
    }

    return (
        <div>
             <AceEditor
                mode="json"
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
            {
                responseChanges.map((responseChange) => {
                    return (
                        <div style={{marginBotton: 20}}>
                            <ReactDiffViewer
                                oldValue={JSON.stringify(response)}
                                newValue={decodeResponseChange(responseChange.body, JSON.stringify(response, null, 2))}
                                splitView={false}
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
                        </div>
                    )
                })
            }
        </div>
    );
}

export default RequestDiff;
