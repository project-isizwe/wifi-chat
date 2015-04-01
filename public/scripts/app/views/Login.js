define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Login')
      , ModalView   = require('app/views/Modal')
      , Error       = require('app/models/modal/Error')

    return Base.extend({

        template: _.template(require('text!tpl/Login.html')),
      
        className: 'login screen',

        title: 'Login',

        events: {
          'submit': 'login',
          'click .js-signup': 'signup'
        },
      
        initialize: function(options) {
          this.options = options
          this.router = options.router
          this.modal = new ModalView(options)
          this.registerEvents()
        },
      
        registerEvents: function() {
          var self = this
          socket.on('xmpp.connection', function(data) {
            log('Connected as', data.jid)
            self.performDiscovery()
          })
          socket.on('xmpp.error', function(error) {
            log('Login failed', error)
            var message =  'We\'re sorry but the system is down!'
            if ('login-fail' === error.condition) {
              message = 'Whoops! Username / password combination incorrect' 
            } else if ('unknown' === error.condition) {
              message = 'Oh no! Bad username, please check!'
            }
            self.showError(new Error({
              type: 'error',
              showClose: true,
              message: message
            }))
            self.enableLoginButton()
          })
        },
      
        enableLoginButton: function() {
          this.$el.find('button').attr('disabled', false)
        },
       
        performDiscovery: function() {
          log('Performing discovery')
          var self = this
          var options = {}
          socket.send('xmpp.buddycloud.discover', options, function(error, server) {
            log('Discovery response', error, server)
            if (error) {
              self.enableLoginButton()
              var errorModel = new Error({
                type: 'error',
                message: 'We\'re sorry but the system is down!',
                showClose: true
              })
              return self.showError(errorModel)
            }
            socket.send('xmpp.buddycloud.register', {}, function() {})
            self.router.setLoggedIn().showTermsAndConditions()
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
          this.showSpinner()
        }

    })

})
