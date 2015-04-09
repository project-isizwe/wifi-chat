define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Login')
      , subscriptions = require('app/store/Subscriptions')

    return Base.extend({

        template: _.template(require('text!tpl/Login.html')),
      
        className: 'login screen',

        title: 'Login',

        events: {
          'submit': 'login',
          'click .js-signup': 'signup',
          'click .js-forgotPassword': 'password',
          'blur input': 'inidicateValidation',
        },

        inidicateValidation: function(event) {
          // add a nonEmpty class when the input is non-empty
          $(event.currentTarget).toggleClass('nonEmpty', event.currentTarget.value !== "")
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
            self.connectedJid = data.jid
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

        onDestroy: function() {
          socket.off('xmpp.connection')
          socket.off('xmpp.error')
        },
      
        enableLoginButton: function() {
          this.$el.find('button').attr('disabled', false)
        },
       
        performDiscovery: function() {
          log('Performing discovery')
          var self = this
          var options = {}
          if (localStorage.getItem('channel-server')) {
            options.server = localStorage.getItem('channel-server')
          }
          socket.send('xmpp.buddycloud.discover', options, function(error, server) {
            log('Discovery response', error, server)
            if (error) {
              self.enableLoginButton()
              localStorage.removeItem('channel-server')
              return self.showError('We\'re sorry but the system is down!')
            }
            subscriptions.sync()
            socket.send('xmpp.buddycloud.register', {}, function() {})
            localStorage.setItem('channel-server', server)
            
            self.router.setLoggedIn(self.connectedJid)
            
            if (self.router.lastRoute) {
              return self.router[self.router.lastRoute.method]
                .apply(self.router, [ self.router.lastRoute.parameters ])
            }
            self.router.showHome()
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
