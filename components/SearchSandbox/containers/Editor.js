import React, { Component } from 'react';
import {
 Row, Col, Card, Button, Modal, Form, message,
} from 'antd';
import { ReactiveBase, SelectedFilters } from '@appbaseio/reactivesearch';
import SelectedTag from '@appbaseio/reactivesearch/lib/styles/Button';
import PropTypes from 'prop-types';

import multiListTypes from '../utils/multilist-types';
import RSWrapper from '../components/RSWrapper';
import { formWrapper, tagContainer } from '../styles';
import DataFieldInput from '../components/DataFieldInput';
import { getAvailableDataField } from '../utils/dataField';
import {
 NumberInput, TextInput, DropdownInput, ToggleInput,
} from '../../shared/Input';

export default class Editor extends Component {
	constructor(props) {
		super(props);
		const { mappings } = props;
		const dataFields = getAvailableDataField({
			id: 'MultiList',
			component: 'MultiList',
			mappings,
		});
		this.state = {
			showModal: false,
			listComponentProps: {
				dataField: dataFields.length ? dataFields[0] : '',
			},
			renderKey: Date.now(),
			showVideo: false,
		};
	}

	showModal = () => {
		this.setState({
			showModal: true,
		});
	};

	resetNewComponentData = () => {
		const { mappings } = this.props;
		const dataFields = getAvailableDataField({
			id: 'MultiList',
			component: 'MultiList',
			mappings,
		});
		this.setState({
			listComponentProps: {
				dataField: dataFields.length ? dataFields[0] : '',
			},
		});
	};

	handleOk = () => {
		// only set to store if dataField is valid
		const { mappings } = this.props;
		const fields = getAvailableDataField({ id: 'MultiList', component: 'MultiList', mappings });
		if (fields.length) {
			const { filterCount, setFilterCount, onPropChange } = this.props;
			const { listComponentProps } = this.state;
			onPropChange(`list-${filterCount + 1}`, listComponentProps);
			setFilterCount(filterCount + 1);
			this.setState(
				{
					showModal: false,
				},
				this.resetNewComponentData,
			);
			message.success('New filter added');
		} else {
			this.setState({
				showModal: false,
			});
		}
	};

	handleCancel = () => {
		this.setState(
			{
				showModal: false,
			},
			this.resetNewComponentData,
		);
	};

	handleVideoModal = () => {
		this.setState(({ showVideo }) => ({
			showVideo: !showVideo,
		}));
	};

	setComponentProps = (newProps) => {
		const { listComponentProps } = this.state;
		this.setState({
			listComponentProps: {
				...listComponentProps,
				...newProps,
			},
		});
	};

	renderFormItem = (item, name) => {
		let FormInput = null;

		const { listComponentProps } = this.state;
		const value = listComponentProps[name] || item.default;

		switch (item.input) {
			case 'bool': {
				FormInput = (
					<ToggleInput name={name} value={value} handleChange={this.setComponentProps} />
				);
				break;
			}
			case 'number': {
				FormInput = (
					<NumberInput
						name={name}
						value={Number(value)}
						min={1}
						handleChange={this.setComponentProps}
					/>
				);
				break;
			}
			case 'dropdown': {
				FormInput = (
					<DropdownInput
						options={multiListTypes[name].options}
						value={value}
						name={name}
						handleChange={this.setComponentProps}
					/>
				);
				break;
			}
			default: {
				FormInput = (
					<TextInput name={name} value={value} handleChange={this.setComponentProps} />
				);
				break;
			}
		}

		return (
			<Form.Item label={item.label} colon={false} key={name}>
				<div style={{ margin: '0 0 6px' }} className="ant-form-extra">
					{item.description}
				</div>
				{FormInput}
			</Form.Item>
		);
	};

	renderPropsForm = () => {
		const { mappingsURL, mappings } = this.props;
		const fields = getAvailableDataField({ id: 'MultiList', component: 'MultiList', mappings });
		if (!fields.length) {
			return (
				<p>
					There are no compatible fields present in your data mappings.{' '}
					<a href={mappingsURL}>You can edit your mappings</a> to add filters
					(agggregation components).
				</p>
			);
		}

		const { listComponentProps } = this.state;
		return (
			<Form onSubmit={this.handleSubmit} className={formWrapper}>
				<DataFieldInput
					label={multiListTypes.dataField.label}
					description={multiListTypes.dataField.description}
					setComponentProps={this.setComponentProps}
					componentProps={listComponentProps}
					getAvailableDataField={() => getAvailableDataField({ id: 'MultiList', component: 'MultiList', mappings })
					}
				/>
				{Object.keys(multiListTypes)
					.filter(item => item !== 'dataField')
					.map(item => this.renderFormItem(multiListTypes[item], item))}
			</Form>
		);
	};

	setRenderKey = (newKey) => {
		this.setState({
			renderKey: newKey,
		});
	};

	render() {
		const {
			componentProps,
			appName,
			credentials,
			url,
			deleteComponent,
			useCategorySearch,
		} = this.props;
		const { renderKey, showModal, showVideo } = this.state;
		const title = (
			<span>
				Search Preview{' '}
				{window.innerWidth > 1280 ? (
					<Button style={{ float: 'right' }} onClick={this.handleVideoModal} size="small">
						Watch Video
					</Button>
				) : null}
			</span>
		);
		return (
			<ReactiveBase app={appName} credentials={credentials} url={url} analytics>
				<Row gutter={16} style={{ padding: 20 }}>
					<Col span={6}>
						<Card title={title} id="video-title">
							<Button
								style={{ width: '100%' }}
								size="large"
								icon="plus-circle-o"
								className="search-tutorial-3"
								onClick={this.showModal}
							>
								Add New Filter
							</Button>
						</Card>
						{Object.keys(componentProps)
							.filter(item => item !== 'search' && item !== 'result')
							.map(config => (
								<Card key={config} style={{ marginTop: 20 }}>
									<RSWrapper
										id={config}
										component="MultiList"
										componentProps={componentProps[config] || {}}
										onDelete={deleteComponent}
										full
									/>
								</Card>
							))}
					</Col>
					<Col span={18}>
						<Card>
							<RSWrapper
								id="search"
								component={useCategorySearch ? 'CategorySearch' : 'DataSearch'}
								componentProps={componentProps.search || {}}
							/>
						</Card>

						<Card>
							<SelectedFilters
								render={(props) => {
									const { selectedValues, setValue, clearValues, components } = props;
									const clearFilter = (component) => {
										setValue(component, null);
									};

									const filters = Object.keys(selectedValues).map((component) => {
										if(!components.includes(component)) {
											return null;
										}

										if (
											!selectedValues[component].value
											|| selectedValues[component].value.length === 0
										) return null;
										const value = `${component} : ${
											selectedValues[component].value
										}`;

										return (
											<SelectedTag
												className="tag"
												onClick={() => clearFilter(component, null)}
												key={component}
											>
												<span dangerouslySetInnerHTML={{ __html: value }} />
												<span>&nbsp; &#x2715;</span>
											</SelectedTag>
										);
									});

									return (
										<div className={tagContainer}>
											{filters}
											{filters.filter(Boolean).length ? (
												<SelectedTag
													className="tag"
													key="clear all"
													onClick={clearValues}
												>
													Clear All
												</SelectedTag>
											) : null}
										</div>
									);
								}}
							/>
							<RSWrapper
								id="result"
								component="ReactiveList"
								key={renderKey}
								componentProps={
									componentProps.result
										? {
												...componentProps.result,
												react: {
													and: Object.keys(componentProps).filter(
														item => item !== 'result',
													),
												},
										  }
										: {}
								}
								setRenderKey={this.setRenderKey}
								full
								showDelete={false}
							/>
						</Card>
					</Col>

					<Modal
						title="Add New Filter"
						visible={showModal}
						onOk={this.handleOk}
						onCancel={this.handleCancel}
						okText="Add"
						destroyOnClose
					>
						{this.renderPropsForm()}
					</Modal>
					<Modal
						title="Search Preview: 1 min walkthrough"
						visible={showVideo}
						onOk={this.handleVideoModal}
						onCancel={this.handleVideoModal}
						destroyOnClose
					>
						<iframe
							width="460"
							height="240"
							src="https://www.youtube.com/embed/f5SHz80r9Ro"
							frameBorder="0"
							title="Dejavu"
							allow="autoplay; encrypted-media"
							allowFullScreen
						/>
					</Modal>
				</Row>
			</ReactiveBase>
		);
	}
}

Editor.propTypes = {
	mappingsURL: PropTypes.string,
};

Editor.defaultProps = {
	mappingsURL: '/mappings',
};
