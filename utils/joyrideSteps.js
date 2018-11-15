import React from 'react';

const searchPreviewSteps = [
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

const credentialSteps = [
	{
		content: (
			<span>
				This option is used to create new Credentials but you need to be on paid plan for
				adding advanced security permissions.
			</span>
		),
		target: '.credentials-tutorial-1',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				This option is used to edit exisiting Credentials permissions but you need to be on
				paid plan for adding advanced security permissions.
			</span>
		),
		target: '.credentials-tutorial-2',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				<b>Read-only</b> credentials is only use to read the data from app and cannot modify
				data present on the app, it is best to use read credentials when you are just
				displaying the data.
			</span>
		),
		target: '.credentials-tutorial-3',
		placement: 'bottom',
	},
	{
		content: (
			<span>
				<b>Write</b> credentials can modify data in your app, do not use them in code that
				runs in the web browser. Instead, generate read-only credentials.
			</span>
		),
		target: '.credentials-tutorial-4',
		placement: 'bottom',
	},
];

const joyrideSteps = (component) => {
	switch (component) {
		case 'SearchPreview':
			return searchPreviewSteps;
		case 'Credentials':
			return credentialSteps;
		default:
			return null;
	}
};

export default joyrideSteps;
