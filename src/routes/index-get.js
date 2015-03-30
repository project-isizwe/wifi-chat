var debug = require('debug')('wifi-chat:routes:index')
module.exports = function(req, res) {
  debug('Serving index route')
  res.sendFile(process.cwd() + '/public/index.html')
}
