import React from 'react';
import SummaryCard from './SummaryCard';
import Flex from '../../../shared/Flex';

const SummeryCard = () => (
	<Flex flexDirection="row" justifyContent="space-around" css="flex-wrap:wrap">
		<SummaryCard title="Total Searches" count="5,178" border="#00f68e" />
		<SummaryCard title="Total Impressions" count="5,178" border="#1A74FF" />
		<SummaryCard title="Average Click Rate" count="5,178" border="#1A74FF" />
		<SummaryCard title="Conversion" count="5,178" border="#C944FF" />
	</Flex>
);
export default SummeryCard;
