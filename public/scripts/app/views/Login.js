define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Base       = require('app/views/Base')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Login')

    return Base.extend({

        template: _.template(require('text!tpl/Login.html')),
      
        className: 'login screen',

        title: 'Login',

        events: {
          'submit': 'login',
          'click .js-signup': 'signup'
        },
      
        registerEvents: function() {
          var self = this
          socket.on('xmpp.connection', function(data) {
            log('Connected as', data.jid)
            self.router.setLoggedIn().showDiscovery()
          })
          socket.on('xmpp.error', function() {
            log('Bad username / password combination')
            alert('Bad username / password combo')
            $(self.el).find('button').attr('disabled', false)
          })
        },
      
        signup: function() {
          this.options.router.showSignup()
        },

        login: function(event) {
          event.preventDefault()
          this.$el.find('button').attr('disabled', 'disabled')
          var username = this.$el.find('input[name="login-username"]').val()
          var password = this.$el.find('input[name="login-password"]').val()
          socket.send('xmpp.login', { jid: username, password: password })
        }

    })

})
