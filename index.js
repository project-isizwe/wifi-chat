var express      = require('express')
  , serveStatic  = require('serve-static')
  , errorHandler = require('errorhandler')
  , Emitter      = require('primus-emitter')
  , Primus       = require('primus')
  , xmpp         = require('xmpp-ftw')
  , Buddycloud   = require('xmpp-ftw-buddycloud')
  , helmet       = require('helmet')
  , index        = require('./src/routes/index-get')
  , account      = require('./src/routes/account')
  , debug        = require('debug')('wifi-chat:index')
  , bodyParser   = require('body-parser')

require('colors')

var environment = process.env.NODE_ENV || 'production'

try {
  var config = require('./config.' + environment + '.js')
  config.environment = environment
} catch (e) {
  console.log(('Config file config.' + environment + '.js not found').red)
  process.exit(1)
}

account.setConfig(config)
index.setConfig(config)

var app = express()

var server = app.listen(3000, function() {
  debug('Listening on port %d', server.address().port)
})

app.disable('x-powered-by')
app.use(serveStatic(__dirname + '/public'))
app.use(errorHandler({
  dumpExceptions: ('development' === environment),
  showStack: ('development' === environment)
}))
app.use(helmet())
app.use(bodyParser.json())
app.set('strict routing', false)

var router = express.Router()

router.post('/account', account.createAccount)
router.post('/account/reset', account.generateResetPasswordToken)
router.post('/account/reset/:token', account.resetPassword)

router.get('/*', index.route)
app.use('/', router)

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

/**
 * Prevent users from posting new threads
 */
Buddycloud.prototype.publishItem = function(data, callback) {
    if (!this._checkCall(data, callback)) return
    if (!data.content ||
        !data.content['in-reply-to'] ||
        (data.content['in-reply-to'].length < 5)) {
      this._clientError(
        'You are not able to create new topics currently', data, callback
      )
    }
    this.publish(data, callback)
}

Buddycloud.prototype._events = {
    'xmpp.buddycloud.discover': 'discover',
    'xmpp.buddycloud.register': 'setRegister',
    'xmpp.buddycloud.presence': 'setPresence',
    'xmpp.buddycloud.publish': 'publishItem',
    'xmpp.buddycloud.retrieve': 'retrieve',
    'xmpp.buddycloud.items.recent': 'recentItems',
    'xmpp.buddycloud.items.feed': 'userFeedItems',
    'xmpp.buddycloud.items.replies': 'getReplies',
    'xmpp.buddycloud.items.thread': 'getThread',
    'xmpp.buddycloud.config.set': 'setConfiguration',
    'xmpp.buddycloud.config.get': 'getConfiguration',
    'xmpp.buddycloud.subscriptions': 'getNodeSubscriptions',
    'xmpp.buddycloud.affiliations': 'getNodeAffiliations',
    'xmpp.buddycloud.discover.items': 'discoverItems',
    'xmpp.buddycloud.discover.info': 'discoverFeatures',
    'xmpp.buddycloud.discover.media-server': 'discoverMediaServer',
    'xmpp.buddycloud.search.get': 'searchGet',
    'xmpp.buddycloud.search.do': 'performSearch',
    'xmpp.buddycloud.register.get': 'getRegister',
    'xmpp.buddycloud.register.set': 'setRegister',
    'xmpp.buddycloud.register.password': 'changePassword',
    'xmpp.buddycloud.http.confirm': 'approveRequest',
    'xmpp.buddycloud.http.deny': 'denyRequest'
}

var buddycloudCache = {}

primus.on('connection', function(socket) {
  debug('Websocket connection made')
  var xmppFtw = new xmpp.Xmpp(socket)
  var buddycloud = new Buddycloud()
  buddycloud.setDiscoveryTimeout(10000)
  buddycloud.setMediaServerDiscoveryTimeout(5000)
  buddycloud.setCache(buddycloudCache)
  xmppFtw.addListener(buddycloud)
  socket.xmppFtw = xmppFtw
})

primus.on('disconnection', function(socket) {
  debug('Client disconnected, logging them out')
  socket.xmppFtw.logout()
})