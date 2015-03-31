define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Base       = require('app/views/Base')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Register')

    return Base.extend({

        template: _.template(require('text!tpl/Signup.html')),
      
        className: 'signup screen',
      
        title: 'Signup',

        events: {
          'submit': 'signup',
        },
      
        registerEvents: function() {
          var self = this
          socket.on('xmpp.connection', function(data) {
            log('Registered as', data.jid)
            self.router.setLoggedIn().showDiscovery()
          })
          socket.on('xmpp.error', function(error) {
            log('Registration failed', error)
            alert('Registration failed ' + JSON.stringify(error))
            $(self.el).find('button').attr('disabled', false)
          })
        },
      
        signup: function() {
          this.options.router.showSignup()
        },

        register: function(event) {
          event.preventDefault()
          $(this.el).find('button').attr('disabled', 'disabled')
          var username = $('input[name="login-username"]').val()
          var password = $('input[name="login-password"]').val()
          socket.send('xmpp.login', { jid: username, password: password, register: true })
        }

    })

})
