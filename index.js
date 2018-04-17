'use strict'

var util = require('util')
var insertCSS = require('insert-css')

insertCSS('.object-explorer {background: white;padding: 1em;white-space: nowrap;overflow: auto;}.object-explorer .indent {padding-left: 1em;}' +
          '.object-explorer .property-left {min-width: 10em;display: inline-block;}' + 
          '.object-explorer .expand-button {padding: 0.1em;margin: 0;font-size: 1em; height: auto;width: auto;background: none;border: none;color: black;outline: none;}' +
          '.object-explorer .expand-button:hover {background: none;color: gray;}' +
          '.object-explorer .property {color: #2AA198;}.object-explorer .number {color: #D33682;}.object-explorer .string {color: #859900;}.object-explorer .atom {color: #D33682;}')

module.exports = Explorer

function ExpandState() {
  
}
ExpandState.prototype.expand = function (name) {
  this['key:' + name.join('.')] = true
}
ExpandState.prototype.contract = function (name) {
  this['key:' + name.join('.')] = false
}
ExpandState.prototype.isExpanded = function (name) {
  return this['key:' + name.join('.')]
}

function Explorer(object, expandState, arrayPageSize) {
  this.object = object
  this.state = (expandState && expandState.state) || expandState || new ExpandState()
  this.arrayPageSize = arrayPageSize || 50
}
Explorer.prototype.appendTo = function (parent) {
  var container = document.createElement('div')
  container.setAttribute('class', 'object-explorer')
  container.appendChild(this.getNode(this.object, []))
  return parent.appendChild(container)
}
Explorer.prototype.isExpanded = function (path) {
  return this.state.isExpanded(path)
}
Explorer.prototype.isInline = function isInline(obj, path) {
  if (typeof obj === 'string' || typeof obj === 'number') {
    return true
  }
  if (obj === true || obj === false || obj === null || obj === undefined) {
    return true
  }
  if (Array.isArray(obj) && obj.length === 0) {
    return true
  }

  if (!Array.isArray(obj) && obj && typeof obj === 'object' && Object.keys(obj).length === 0) {
    return true
  }

  return false
}
Explorer.prototype.getNode = function getNode(obj, path) {
  if (typeof obj === 'string' || typeof obj === 'number') {
    return span(typeof obj, util.inspect(obj))
  }
  if (obj === true || obj === false || obj === null || obj === undefined) {
    return span('atom', util.inspect(obj))
  }
  if (Object.prototype.toString.call(obj) === '[object Date]') {
    return span('atom', obj.toISOString())
  }
  if (Object.prototype.toString.call(obj) === '[object RegExp]') {
    return span('atom', obj.toString())
  }
  if (Array.isArray(obj)) {
    return this.getNodeForArray(obj, path)
  }
  if (typeof obj === 'object') {
    return this.getNodeForObject(obj, path)
  }
}

Explorer.prototype.getExpandButton = function getExpandable(obj, path) {
  var contractedText = Array.isArray(obj) ? '[+]' : typeof obj === 'object' ? '{+}' : '(+)'
  var expandedText = Array.isArray(obj) ? '[-]' : typeof obj === 'object' ? '{-}' : '(-)'
  var isExpanded = false
  var expand = document.createElement('button')
  expand.setAttribute('class', 'expand-button')
  expand.textContent = contractedText
  var handlers = {}
  function on(name, handler) {
    handlers[name] = handler
  }
  var state = this.state
  expand.addEventListener('click', onClick, false)
  function onClick() {
    isExpanded = !isExpanded
    expand.textContent = isExpanded ? expandedText : contractedText
    if (isExpanded) {
      handlers['expanded']()
      state.expand(path)
    } else {
      handlers['contracted']()
      state.contract(path)
    }
  }
  return {node: expand, on: on, toggle: onClick}
}
Explorer.prototype.getContractedNode = Explorer.prototype.getNode

Explorer.prototype.getNodeForArray = function getNodeForArray(arr, path) {
  if (arr.length === 0) return document.createTextNode('[]')
  var self = this

  if (arr.length > self.arrayPageSize) {
    var arrLength = arr.length
    var pages = Math.ceil(arrLength / self.arrayPageSize)
    var pagedObject = {}
    var upperLimit
    var lowerLimit
    for (var i = 0; i < pages; i ++) {
      lowerLimit = i * self.arrayPageSize
      upperLimit = ((i + 1) * self.arrayPageSize) - 1
      if (upperLimit > arrLength) {
        upperLimit = arrLength
      }
      pagedObject[lowerLimit + '..' + upperLimit] = arr.slice(lowerLimit, upperLimit + 1)
    }
    return self.getNodeForObject(pagedObject, path, { asArray: true })
  } else {
    var outer = document.createElement('div')
    outer.appendChild(document.createTextNode('['))
    arr = arr.map(function (node, i) { return self.getContractedNode(node, path.concat(i.toString())) })
    arr.forEach(function (node) {
      var buf = document.createElement('div')
      buf.setAttribute('class', 'indent')
      buf.appendChild(node)
      outer.appendChild(buf)
    })
    outer.appendChild(document.createTextNode(']'))
    return outer
  }
}

Explorer.prototype.getNodeForObject = function getNodeForObject(obj, path, options) {
  options = options || { asArray: false }

  var leftChar = options.asArray ? '[' : '{'
  var rightChar = options.asArray ? ']' : '}'

  if (Object.keys(obj).length === 0) return document.createTextNode(leftChar + rightChar)
  var self = this

  var outer = document.createElement('div')
  outer.appendChild(document.createTextNode(leftChar))

  Object.keys(obj).forEach(function (key) {
    outer.appendChild(self.getNodeForProperty(key, obj[key], '', path.concat(key)))
  })

  outer.appendChild(document.createTextNode(rightChar))
  return outer
}

Explorer.prototype.getNodeForProperty = function getNodeForObject(name, value, description, path) {
  var buf = document.createElement('div')
  buf.setAttribute('class', 'indent')

  var left = document.createElement('span')
  left.setAttribute('class', 'property-left')

  left.appendChild(span('property', name))
  left.appendChild(document.createTextNode(': '))

  var right = span('property-right', description || '')

  if (this.isInline(value, path)) {
    left.appendChild(this.getNode(value, path))
    buf.appendChild(left)
    buf.appendChild(right)
  } else {
    var expand = this.getExpandButton(value, path)
    left.appendChild(expand.node)
    buf.appendChild(left)
    buf.appendChild(right)
    var body = null
    var self = this
    expand.on('expanded', function () {
      if (body === null) {
        body = self.getNode(value, path)
        buf.appendChild(body)
      } else {
        body.style.display = 'block'
      }
    })
    expand.on('contracted', function () {
      body.style.display = 'none'
    })
    if (this.isExpanded(path)) {
      expand.toggle()
    }
  }

  return buf
}


function span(cls, content) {
  if (typeof content === 'string') {
    content = document.createTextNode(content)
  }
  var span = document.createElement('span')
  span.setAttribute('class', cls)
  span.appendChild(content)
  return span
}