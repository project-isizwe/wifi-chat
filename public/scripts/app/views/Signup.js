define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Register')

    return Base.extend({

        template: _.template(require('text!tpl/Signup.html')),
      
        className: 'signup screen',
      
        title: 'Signup',

        events: {
          'submit': 'register',
        },

        initialize: function(options) {
          this.options = options
          this.router = options.router
          this.registerEvents()
        },
      
        registerEvents: function() {
          var self = this
          socket.on('xmpp.connection', function(data) {
            log('Registered as', data.jid)
            self.router.setLoggedIn().showRules()
          })
          socket.on('xmpp.error', function(error) {
            log('Registration failed', error)
            self.showError('Registration failed')
            self.enableRegisterButton()
          })
        },

        enableRegisterButton: function() {
          this.$el.find('button').attr('disabled', false)
        },

        register: function(event) {
          event.preventDefault()
          this.$el.find('button').attr('disabled', 'disabled')
          var username = this.$el.find('input[name="username"]').val()
          var password = this.$el.find('input[name="password"]').val()
          var email = this.$el.find('input[name="email"]').val()
          socket.send('xmpp.login', { 
            jid: username, 
            password: password,
            email: email, 
            register: true 
          })
          this.showSpinner('Registering')
        },

    })

})
