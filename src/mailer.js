'use strict';

var email   = require('emailjs')
  , debug = require('debug')('wifi-chat:mailer')

var config = null
  , server = null

var connect = function() {
  debug('Connecting to mail server', config.email.connection)
  server = email.server.connect(config.email.connection)
}

var setConfig = function(configuration) {
  config = configuration
  connect()
}

var sendMail = function(to, subject, template, substitutions, callback) {
  var content = template.replace(new RegExp('%url%', 'g'), config.url)
  Object.keys(substitutions || {}).forEach(function(key) {
    content = content.replace(new RegExp('%' + key + '%', 'g'), substitutions[key])
  })
  var message = {
    text: content,
    from: config.email.sendAddress,
    to: to,
    subject: subject
  }
  debug('Sending email', message)
  server.send(message, callback)
}

module.exports = {
  setConfig: setConfig,
  sendMail: sendMail
}