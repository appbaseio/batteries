import React from 'react';
import {
 Tree, Row, Col, Button,
} from 'antd';
import Appbase from 'appbase-js';
import ExpandCollapse from 'react-expand-collapse';

import EditorJSON from './EditorJSON';
import DeleteJSON from './DeleteJSON';
import { listItem } from '../styles';
import { SandboxContext } from '../index';
import getNestedValue from '../utils';

const { TreeNode } = Tree;

const RenderResults = props => (
	<SandboxContext.Consumer>
		{contextValue => <RenderResultsConsumer {...contextValue} {...props} />}
	</SandboxContext.Consumer>
);

class RenderResultsConsumer extends React.Component {
	constructor(props) {
		super(props);
		const { appName, url, credentials } = props;
		this.appbaseRef = Appbase({
			app: appName,
			url,
			credentials,
		});
	}

	renderAsTree = (res, key = '0') => {
		if (!res) return null;
		const iterable = Array.isArray(res) ? res : Object.keys(res);
		return iterable.map((item, index) => {
			const type = typeof res[item];
			if (type === 'string' || type === 'number') {
				const title = (
					<div>
						<span>{item}:</span>
						&nbsp;
						<span dangerouslySetInnerHTML={{ __html: res[item] }} />
					</div>
				);
				return <TreeNode title={title} key={`${key}-${index + 1}`} />;
			}
			const hasObject = res[item] === undefined && typeof item !== 'string';
			const node = hasObject ? item : res[item];
			return (
				<TreeNode
					title={
						typeof item !== 'string'
							? 'Object'
							: `${node || Array.isArray(res) ? item : `${item}: null`}`
					}
					key={`${key}-${index + 1}`}
				>
					{this.renderAsTree(node, `${key}-${index + 1}`)}
				</TreeNode>
			);
		});
	};

	render() {
		const {
			res,
			setRenderKey,
			mappingsType,
			triggerClickAnalytics,
			type,
			metaFields,
		} = this.props;
		const { _id, _index, ...renderedJSON } = res;
		switch (type) {
			case 'list': {
				const {
					url: urlKey,
					title: titleKey,
					image: imageKey,
					description: descriptionKey,
				} = metaFields;
				const url = getNestedValue(res, urlKey);
				const title = getNestedValue(res, titleKey);
				const description = getNestedValue(res, descriptionKey);
				const image = getNestedValue(res, imageKey);
				return (
					<Row
						type="flex"
						onClick={triggerClickAnalytics}
						key={res._id}
						style={{ margin: '20px auto', borderBottom: '1px solid #ededed' }}
					>
						<Col span={image ? 6 : 0}>
							<img style={{ width: '100%' }} src={image} alt={title} />
						</Col>
						<Col span={image ? 18 : 24}>
							<h3
								style={{ fontWeight: '600' }}
								dangerouslySetInnerHTML={{ __html: title }}
							/>
							<p
								style={{ fontSize: '1em' }}
								dangerouslySetInnerHTML={{ __html: description }}
							/>
						</Col>
						<div style={{ width: '100%', marginBottom: '10px', textAlign: 'right' }}>
							{url ? (
								<Button
									shape="circle"
									icon="link"
									style={{ marginRight: '5px' }}
									onClick={() => window.open(url, '_blank')}
								/>
							) : null}
							<EditorJSON
								res={res}
								mappingsType={mappingsType}
								appbaseRef={this.appbaseRef}
								setRenderKey={setRenderKey}
							/>
							<DeleteJSON
								res={res}
								mappingsType={mappingsType}
								appbaseRef={this.appbaseRef}
								setRenderKey={setRenderKey}
							/>
						</div>
					</Row>
				);
			}
			default:
				return (
					<div className={listItem} key={_id} onClick={triggerClickAnalytics}>
						<ExpandCollapse previewHeight="390px" expandText="Show more">
							{<Tree showLine>{this.renderAsTree(renderedJSON)}</Tree>}
						</ExpandCollapse>
						<div style={{ marginTop: 10, textAlign: 'right' }}>
							<EditorJSON
								res={res}
								mappingsType={mappingsType}
								appbaseRef={this.appbaseRef}
								setRenderKey={setRenderKey}
							/>
							<DeleteJSON
								res={res}
								mappingsType={mappingsType}
								appbaseRef={this.appbaseRef}
								setRenderKey={setRenderKey}
							/>
						</div>
					</div>
				);
		}
	}
}

export default RenderResults;
