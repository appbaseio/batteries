import React from 'react';
import { Button, Card } from 'antd';
import { cardTitle, card } from '../styles';

const MappingsContainer = ({ showCardWrapper, showMappingInfo, children }) => {
	if (showCardWrapper) {
		return (
			<Card
				hoverable
				title={
					showMappingInfo ? (
						<div className={cardTitle}>
							<div>
								<h4>Manage Mappings</h4>
								<p>Add new fields or change the types of existing ones.</p>
							</div>
							<Button onClick={() => this.handleModal('showModal')} type="primary">
								Add New Field
							</Button>
						</div>
					) : null
				}
				bodyStyle={{ padding: 0 }}
				className={card}
			>
				{children}
			</Card>
		);
	}

	return children;
};

export default MappingsContainer;
