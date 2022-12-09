import React from 'react';
import { Slider, Modal, Card, Button } from 'antd';
import { cardTitle, card } from '../styles';

const Shards = ({
	shards,
	allocated_shards,
	updateShards,
	shardsModal,
	handleModal,
	handleSlider,
}) => (
	<React.Fragment>
		<Card
			hoverable
			title={
				<div className={cardTitle}>
					<div>
						<h4>Manage Shards</h4>
						<p>Configure the number of shards for your index.</p>
					</div>
					<Button onClick={() => handleModal('shardsModal')} type="primary">
						Change Shards
					</Button>
				</div>
			}
			bodyStyle={{ padding: 0 }}
			className={card}
		/>
		<Modal
			visible={shardsModal}
			onOk={updateShards}
			title="Configure Shards"
			okText="Update"
			okButtonProps={{ disabled: allocated_shards === +shards }}
			onCancel={() => handleModal('shardsModal')}
		>
			<h4>
				Move slider to change the number of shards for your index. Read more{' '}
				<a href="https://docs.reactivesearch.io/docs/search/relevancy/#index-settings">here</a>.
			</h4>
			<Slider
				step={1}
				max={100}
				value={+shards}
				onChange={value => handleSlider('shards', value)}
			/>
		</Modal>
	</React.Fragment>
);

export default Shards;
