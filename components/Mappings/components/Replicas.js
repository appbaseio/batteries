import React from 'react';
import { Card, Button, Slider, Modal } from 'antd';
import { cardTitle, card } from '../styles';

const Replicas = ({
	replicas,
	totalNodes,
	allocated_replicas,
	updateReplicas,
	handleSlider,
	replicasModal,
	handleModal,
}) => (
	<React.Fragment>
		<Card
			hoverable
			title={
				<div className={cardTitle}>
					<div>
						<h4>Manage Replicas</h4>
						<p>Configure the number of replicas for your index.</p>
					</div>
					<Button onClick={() => handleModal('replicasModal')} type="primary">
						Change Replicas
					</Button>
				</div>
			}
			bodyStyle={{ padding: 0 }}
			className={card}
		/>

		<Modal
			visible={replicasModal}
			onOk={updateReplicas}
			title="Configure Replicas"
			okText="Update"
			okButtonProps={{
				disabled: allocated_replicas === +replicas,
			}}
			onCancel={() => handleModal('replicasModal')}
		>
			<h4>Move slider to change the number of replicas for your index.</h4>
			<Slider
				step={null}
				marks={{ 0: '0', 1: '1', 2: '2' }}
				max={totalNodes - 1}
				value={+replicas}
				onChange={value => handleSlider('replicas', value)}
			/>
		</Modal>
	</React.Fragment>
);

export default Replicas;
