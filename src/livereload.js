var flo = require('fb-flo')
  , fs = require('fs')
  , path = require('path')
  , debug = require('debug')('wifi-chat:livereload')

var resolver = function(filepath, callback) {
    debug('File change detected: '.cyan, filepath.cyan)   
    callback({
        resourceURL: filepath,
        contents: fs.readFileSync(
            __dirname + '/../public/' + filepath
        )
    })
}
var server = flo(
    __dirname + '/../public/',
    {
        port: 8888,
        verbose: false,
        glob: [ 'js/**/*', 'css/**/*', 'images/**/*', 'avatar/**/*', 'sounds/**/*' ]
    },
    resolver
)

server.once('ready', function() {
    debug('Live reload is running'.green)
})
