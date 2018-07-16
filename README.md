# batteries
Private plug-able modules for appbase dashboard

## Setup

1. Setup the submodule:

```bash
git submodule init
git submodule sync
git submodule update --recursive --remote
```

2. Installation:

```bash
yarn add emotion react-emotion rc-tooltip react-select antd @appbaseio/reactivesearch
yarn add -D babel-plugin-emotion babel-plugin-import
```

Add `babel-plugin-import`:

```js
// .babelrc or babel-loader option
{
	"plugins": [
		[
			"import",
			{ "libraryName": "antd", "libraryDirectory": "es", "style": "css" }
		]
	]
}
```

> You will need to setup css-loader in your webpack config for react-select

3. Import and use the desired batteries as you please.
