# object-explorer

A browser module to create an extensible gui to explore objects

You can see this module in use for many of the demos on http://demos.forbeslindesay.co.uk/

[![Dependency Status](https://gemnasium.com/ForbesLindesay/object-explorer.png)](https://gemnasium.com/ForbesLindesay/object-explorer)
[![NPM version](https://badge.fury.io/js/object-explorer.png)](http://badge.fury.io/js/object-explorer)

## Installation

    npm install object-explorer

## Basic Usage

```js
var ObjectExplorer = require('object-explorer')
var oe = new ObjectExplorer({myObject})
oe.appendTo(document.getElementById('container'))
```

## License

  MIT