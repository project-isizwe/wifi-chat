define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Login')

    return Base.extend({

        template: _.template(require('text!tpl/Login.html')),
      
        className: 'login screen',

        title: 'Login',

        events: {
          'submit': 'login',
          'click .js-signup': 'signup',
          'click .js-forgotPassword': 'password'
        },
      
        initialize: function(options) {
          this.options = options
          this.router = options.router
          this.registerEvents()
          this.doLogin()
        },
      
        doLogin: function() {
          this.once('render', function() {
            if (this.options.jid) {
              this.$el.find('input[name="username"]').val(this.options.jid)
              this.$el.find('input[name="password"]').val(this.options.password)
              this.login()
            } else if (localStorage.getItem('jid')) {
              this.$el.find('input[name="username"]')
                .val(localStorage.getItem('jid'))
              this.$el.find('input[name="password"]')
                .val(localStorage.getItem('password'))
              this.login()
            }
          }, this)
        },
      
        registerEvents: function() {
          var self = this
          socket.on('xmpp.connection', function(data) {
            log('Connected as', data.jid)
            localStorage.setItem('jid', self.jid)
            localStorage.setItem('password', self.password)
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
            self.showError(message)
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
              return self.showError('We\'re sorry but the system is down!')
            }
            socket.send('xmpp.buddycloud.register', {}, function() {})
            self.router.setLoggedIn().showHome()
          })
        },
      
        signup: function() {
          this.options.router.showSignup()
        },

        login: function(event) {
          if (event) event.preventDefault()
          this.$el.find('button').attr('disabled', 'disabled')
          this.jid = this.$el.find('input[name="username"]').val()
          this.password = this.$el.find('input[name="password"]').val()
          var credentials = { jid: this.jid, password: this.password }
          if (localStorage.getItem('host')) {
            credentials.host = localStorage.getItem('host')
          }
          socket.send('xmpp.login', credentials)
          this.showSpinner('Connecting')
        },

        password: function() {
          this.options.router.showPasswordReset()
        }

    })

})
