define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Backbone   = require('backbone')
      , tpl        = require('text!tpl/Register.html')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Register')
      , template   = _.template(tpl)

    return Backbone.View.extend({

        className: 'signup screen',

        initialize: function (options) {
          this.router = options.router
        },
      
        title: 'Signup',

        render: function () {
          this.$el.html(template())
          return this
        },

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
