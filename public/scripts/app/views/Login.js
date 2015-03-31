define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Backbone   = require('backbone')
      , tpl        = require('text!tpl/Login.html')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Login')
      , template   = _.template(tpl)

    return Backbone.View.extend({

        className: 'login screen',

        initialize: function (options) {
          this.router = options.router
        },
      
        title: 'Login',

        render: function() {
          this.$el.html(template())
          return this
        },

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
