define(function(require) {

    'use strict';

    var $             = require('jquery')
      , _             = require('underscore')
      , Base          = require('app/views/Base')
      , socket        = require('app/utils/socket')
      , log           = require('bows.min')('Views:Login')
      , subscriptions = require('app/store/Subscriptions')
      , config        = require('app/utils/config')

    return Base.extend({

        template: _.template(require('text!tpl/Login.html')),
      
        className: 'login screen',

        title: 'Login',

        events: {
          'submit': 'login',
          'click .js-signup': 'signup',
          'click .js-forgotPassword': 'password',
          'blur input': 'inidicateValidation',
          'input input[name=username]': 'lowerCase',
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
        
        lowerCase: function(event) {
          event.target.value = event.target.value.toLowerCase()
        },
      
        registerEvents: function() {
          log('Registered login events')
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
            self.resetUsername()
            self.showError(message)
            self.enableLoginButton()
          })
        },

        resetUsername: function() {
          this.$el.find('input[name="username"]')
            .val(this.removeDomainIfPresent(this.jid))
        },

        onDestroy: function() {
          socket.off('xmpp.connection')
          socket.off('xmpp.error')
        },
      
        enableLoginButton: function() {
          this.$el.find('button').attr('disabled', false)
        },

        addDomainIfRequired: function(jid) {
          var username = this.$el.find('input[name="username"]')
          if (-1 === username.val().indexOf('@')) {
            jid = jid + '@' + config.domain
          }
          return jid
        },

        removeDomainIfPresent: function(jid) {
          if (-1 !== jid.indexOf('@')) {
            return jid.split('@')[0]
          }
          return jid
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
              self.resetUsername()
              return self.showError('We\'re sorry but the system is down!')
            }
            localStorage.setItem('channel-server', server)
            /* Register to register with channels */
            socket.send('xmpp.buddycloud.register', {}, _.bind(self.completeLogin, self))
          })
        },

        completeLogin: function() {
          log('Registered with server')
          /* Tell the server that we are online */
          socket.send('xmpp.buddycloud.presence', {})
          subscriptions.sync()

          this.router.setLoggedIn(this.connectedJid)
          
          if (this.router.lastRoute) {
            return this.router[this.router.lastRoute.method]
              .apply(this.router, this.router.lastRoute.parameters)
          }
          if (this.options.showRules) {
            return this.router.showRules(options)
          }
          this.router.showHome()
        },
      
        signup: function() {
          this.options.router.showSignup()
        },

        login: function(event) {
          if (event) event.preventDefault()
          this.$el.find('button').attr('disabled', 'disabled')
          this.jid = this.addDomainIfRequired(
            this.$el.find('input[name="username"]').val().toLowerCase()
          )
          this.password = this.$el.find('input[name="password"]').val()
          var credentials = { jid: this.jid, password: this.password }
          if (localStorage.getItem('host')) {
            credentials.host = localStorage.getItem('host')
          }
          socket.send('xmpp.login', credentials)
          var options = {}
          if (this.options.autoLogin) {
            options.opaque = true
            delete this.options.autoLogin

          }
          this.showSpinner('Connecting', options)
        },

        password: function() {
          this.options.router.showPasswordReset()
        }

    })

})
