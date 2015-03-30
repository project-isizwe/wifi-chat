var express    = require('express')
  , Emitter    = require('primus-emitter')
  , Primus     = require('primus')
  , engine     = require('ejs-locals')
  , xmpp       = require('xmpp-ftw')
  , Buddycloud = require('xmpp-ftw-buddycloud')
  , helmet     = require('helmet')

var app = express()

helmet.defaults(app)

app.get('/', function(req, res){
    res.render('index')
})


var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port)
})

app.configure(function() {
    app.use(express.static(__dirname + '/public'))
    app.set('views', __dirname + '/views')
    app.set('view engine', 'ejs')
    app.use(express.bodyParser())
    app.use(express.methodOverride())
    app.use(express.logger)
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }))
    app.engine('ejs', engine)
})

var options = {
    transformer: 'engine.io',
    parser: 'JSON',
    transports: [
        /* 'websocket', */
        'xhr-polling',
        'htmlfile',
        'jsonp-polling'
    ]
}

var primus = new Primus(server, options)
primus.use('emitter', Emitter)
primus.save(__dirname + '/public/scripts/primus.js')

primus.on('connection', function(socket) {
    console.log('Websocket connection made')
    var xmppFtw = new xmpp.Xmpp(socket)
    xmppFtw.addListener(new Buddycloud())
    socket.xmppFtw = xmppFtw
})

primus.on('disconnection', function(socket) {
    console.log('Client disconnected, logging them out')
    socket.xmppFtw.logout()
})