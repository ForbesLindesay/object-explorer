var ObjectExplorer = require('../')
var explorer = document.getElementById('explorer')
var add = document.getElementById('add')

var obj = {
  a: 10,
  b: true,
  reg: /foo/g,
  dat: new Date('2013-08-29'),
  str: "fooo, bar"
}
obj.self = obj
obj.arr = [obj, obj, obj]
obj.longArr = []
for (i = 0; i < 500; i++) obj.longArr.push(i)

var state = null
function next() {
  var e = new ObjectExplorer(obj, state)
  e.appendTo(explorer)
  state = e.state
}
next()


add.addEventListener('click', next, false)