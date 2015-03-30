var debug = require('debug')('wifi-chat:routes:avatar')

module.exports = function(req, res, next) {
   res.sendFile(process.cwd() + '/public/images/avatar-bg.png')
}