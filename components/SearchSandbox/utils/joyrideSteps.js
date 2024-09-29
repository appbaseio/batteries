import React from 'react';

const joyrideSteps = [
	{
		content: (
			<span>
				This is the DataSearch component. Configure it to search your
				index data.
			</span>
		),
		target: '.search-tutorial-1',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				Here you can set the props for the DataSearch component like
				dataField, title, field weights.&nbsp;
				<a
					href="https://docs.reactivesearch.io/docs/reactivesearch/react/v3/search/datasearch/"
					target="_blank"
					rel="noopener noreferrer"
				>
					Read More
				</a>
			</span>
		),
		target: '.search-tutorial-2',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				Here you can add facets to filter the data. Under the hood, each
				facet uses a MultiList component.
			</span>
		),
		target: '.search-tutorial-3',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				The results are displayed using the ReactiveList component.
			</span>
		),
		target: '.search-tutorial-4',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				Here you can set some props for the ReactiveList component for
				pagination, size and sorting.&nbsp;
				<a
					href="https://docs.reactivesearch.io/docs/reactivesearch/react/result/reactivelist/"
					target="_blank"
					rel="noopener noreferrer"
				>
					Read More
				</a>
			</span>
		),
		target: '.search-tutorial-5',
		placement: 'bottom',
	},
];

export default joyrideSteps;
