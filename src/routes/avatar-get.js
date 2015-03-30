var debug = require('debug')('wifi-chat:routes:avatar')
  , identicon = require('identicon')
  , fs = require('fs')

module.exports = function(req, res, next) {
    identicon.generate(req.params.channel, 128, function(error, buffer) {
      debug('Requesting avatar for ' + req.params.channel)
      if (error) {
        return res.send(500)
      }
      var fileName = process.cwd() + '/public/avatar/' + req.params.channel
      fs.writeFile(fileName, buffer, function(error) {
        if (error) {
          debug(('Error generating avatar ' + req.params.channel).red)
        }
        res.redirect('/avatar/' + req.params.channel)
      })
  })
}