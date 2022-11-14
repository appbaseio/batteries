import React from 'react';
import { Button, Card, Modal, Input } from 'antd';

import { card, cardTitle } from '../styles';

const { TextArea } = Input;

const Synonyms = ({
	synonyms,
	synonymsLoading,
	updateSynonyms,
	handleChange,
	showSynonymModal,
	handleModal,
}) => (
	<React.Fragment>
		<Card
			hoverable
			title={
				<div className={cardTitle}>
					<div>
						<h4>Manage Synonyms</h4>
						<p>Add new synonyms or edit the existing ones.</p>
					</div>
					<Button type="primary" onClick={() => handleModal('showSynonymModal')}>
						{synonyms ? 'Edit Synonym' : 'Add Synonym'}
					</Button>
				</div>
			}
			bodyStyle={{ padding: 0 }}
			className={card}
		/>

		<Modal
			visible={showSynonymModal}
			onOk={updateSynonyms}
			title="Add Synonym"
			okText={synonyms ? 'Save Synonym' : 'Add Synonym'}
			okButtonProps={{ loading: synonymsLoading }}
			onCancel={() => handleModal('showSynonymModal')}
		>
			<TextArea
				name="synonyms"
				value={synonyms}
				onChange={handleChange}
				placeholder={
					'Enter comma separated synonym pairs. Enter additional synonym pairs separated by new lines, e.g.\nbritish, english\nqueen, monarch'
				}
				autoSize={{ minRows: 2, maxRows: 10 }}
			/>
		</Modal>
	</React.Fragment>
);

export default Synonyms;
