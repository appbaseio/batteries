export default {
    DataSearch: {
        dataField: {
            label: 'Data Field',
            description: 'Select the fields you want to perform search on',
            types: ['text', 'keyword', 'string'],
            input: 'dropdown',
            multiple: true,
        },
        autosuggest: {
            label: 'Auto Suggest',
            description: 'This will enable search component to fetch suggestions as you type',
            input: 'bool',
        },
        title: {
            label: 'Title',
            description: '',
            input: 'string',
        },
        size: {
            label: 'Size',
            description: 'Total number of suggestions to fetch - if autosuggest is set to true',
            input: 'number',
        },
    },
};
