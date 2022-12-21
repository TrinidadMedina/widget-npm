# xygo-widget

Map widget with integrated Xygo searcher

## Installation

```js
# using npm
npm install widget-xygo
```

## Usage

```js
# using import
import { Widget } from 'widget-xygo';
```

## Example

```js
new Widget ({
  apiKey: 'xxxxxxxxxxxxxxxxxxxx', // provide arcgis developer api key. Required
  position: 'bottom-left' || 'bottom-right' || 'top-left' | 'top-right' , // optional property: default value is 'bottom-right'
  button: true || false // optional property: default value is false
});
```