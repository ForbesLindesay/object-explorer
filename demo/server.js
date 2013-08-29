var http = require('http')
var fs = require('fs')
var browserify = require('browserify')

http.createServer(function (req, res) {
  if (req.url === '/') {
    fs.createReadStream(__dirname + '/index.html').pipe(res)
    return
  }
  if (req.url === '/client.js') {
    browserify(__dirname + '/client.js').bundle().pipe(res)
    return
  }
  res.statusCode = '404'
  res.end('404 not found')
}).listen(3000)

console.log('listening on http://localhost:3000')