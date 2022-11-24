import React from 'react';
import { CopyOutlined, FileTextOutlined } from '@ant-design/icons';
import {
 Button, Popover, Row, Col, Tooltip, notification,
} from 'antd';

import Ace from '../containers/AceEditor';

class EditorJSON extends React.Component {
	state = {
		editorValue: '',
		isValidJSON: true,
		editorObjectId: '',
		isEditable: false,
	};

	handleInitialEditorValue = (res) => {
		const { _id: id, _index: del, ...objectJSON } = res;

		const stringifiedJSON = JSON.stringify(objectJSON, null, '\t');

		this.setState({
			editorObjectId: id,
			editorValue: stringifiedJSON,
		});
	};

	resetEditorValues = () => {
		this.setState({
			editorObjectId: '',
			editorValue: '',
			isEditable: false,
		});
	};

	handleUpdateJSON = (updatedJSONString) => {
		const updatedJSON = JSON.parse(updatedJSONString);
		const { mappingsType, appbaseRef, setRenderKey } = this.props;
		const { editorObjectId } = this.state;
		let responseMessage = {
			message: 'Edit successfully saved',
			description: 'The desired result data was successfully updated.',
			duration: 4,
		};
		appbaseRef
			.update({
				type: mappingsType,
				id: editorObjectId,
				body: {
					doc: updatedJSON,
				},
			})
			.then((res) => {
				this.setState({
					isEditable: false,
				});
				setRenderKey(res._timestamp);
				notification.open(responseMessage);
			})
			.catch(() => {
				responseMessage = {
					message: 'Update JSON',
					description: 'There were error in Updating JSON. Try again Later.',
					duration: 2,
				};
				notification.open(responseMessage);
			});
	};

	copyJSON = (code) => {
		const el = document.createElement('textarea');
		el.value = JSON.stringify(code);
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
		this.setState(
			{
				copied: true,
			},
			() => setTimeout(
					() => this.setState({
							copied: false,
						}),
					300,
				),
		);
	};

	handleEditing = () => {
		this.setState(({ isEditable }) => ({
			isEditable: !isEditable,
		}));
	};

	handleEditingJSON = (value) => {
		let isValidJSON = true;
		try {
			JSON.parse(value);
		} catch (e) {
			isValidJSON = false;
		}
		this.setState({
			editorValue: value,
			isValidJSON,
		});
	};

	render() {
		const {
            isEditable, copied, isValidJSON, editorValue,
        } = this.state; // prettier-ignore
		const { res } = this.props;
		return (
            <Popover
				placement="leftTop"
				trigger="click"
				onVisibleChange={
                    visible => (visible ? this.handleInitialEditorValue(res) : this.resetEditorValues())
				} // prettier-ignore
				content={
					isEditable ? (
						<Ace
							mode="json"
							value={editorValue}
							onChange={value => this.handleEditingJSON(value)}
							theme="monokai"
							name="editor-JSON"
							fontSize={14}
							showPrintMargin
							style={{ maxHeight: '250px' }}
							showGutter
							highlightActiveLine
							setOptions={{
								showLineNumbers: true,
								tabSize: 2,
							}}
							editorProps={{ $blockScrolling: true }}
						/>
					) : (
						<pre style={{ width: 300 }}>{JSON.stringify(res, null, 4)}</pre>
					)
				}
				title={(
                    <Row>
						<Col span={isEditable ? 19 : 18}>
							<h5 style={{ display: 'inline-block' }}>
								{isEditable ? 'Edit JSON' : 'JSON Result'}
							</h5>
						</Col>
						<Col span={isEditable ? 5 : 6}>
							<Tooltip visible={copied} title="Copied">
								<Button
									shape="circle"
									icon={<CopyOutlined />}
									size="small"
									onClick={() => this.copyJSON(res)}
								/>
							</Tooltip>
							{isEditable ? (
								<Button
									size="small"
									type="primary"
									style={{ marginLeft: '5px' }}
									disabled={!isValidJSON}
									onClick={() => this.handleUpdateJSON(editorValue)}
								>
									Update
								</Button>
							) : (
								<Button
									size="small"
									type="primary"
									style={{ marginLeft: '5px' }}
									disabled={!isValidJSON}
									onClick={() => this.handleEditing()}
								>
									Edit
								</Button>
							)}
						</Col>
                    </Row>
                )} // prettier-ignore
			>
				<Button shape="circle" icon={<FileTextOutlined />} style={{ marginRight: '5px' }} />
			</Popover>
        );
	}
}

export default EditorJSON;
