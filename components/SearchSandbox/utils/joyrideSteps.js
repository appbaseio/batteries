import React from 'react';

const joyrideSteps = [
	{
		content: (
			<span>
				This is the DataSearch component which lets us search across one or more fields
				easily.
			</span>
		),
		target: '.search-tutorial-1',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				Here you can set the props of DataSearch component like dataField, title, etc.
				<a
					href="https://opensource.appbase.io/reactive-manual/search-components/datasearch.html"
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
				Here you can add the filter ( MultiList Component ) which is used to filter the list
				( ReactiveList Component ).
			</span>
		),
		target: '.search-tutorial-3',
		placement: 'bottom',
	},
	{
		content: <span>This is the ReactiveList component displaying all the data.</span>,
		target: '.search-tutorial-4',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				Here you can set the props of ReactiveList component like sortField, size, etc.
				<a
					href="https://opensource.appbase.io/reactive-manual/result-components/reactivelist.html"
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
