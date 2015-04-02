define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Register')
      , Account     = require('app/models/Account')

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
          var local = this.$el.find('input[name="username"]').val()
          var password = this.$el.find('input[name="password"]').val()
          var email = this.$el.find('input[name="email"]').val()
          this.showSpinner('Registering')
          var domain = document.location.domain
          if (-1 !== local.indexOf('@')) {
            var splitLocal = local.split('@')
            domain = splitLocal.pop()
            local =  splitLocal.pop()
          }
          this.model = new Account({
            local: local,
            email: email,
            password: password,
            domain: domain
          })

          this.model.save(null, { 
            success: _.bind(this.accountCreated, this),
            error: _.bind(this.accountCreateFail, this)
          })
        
        },
      
        accountCreated: function(model, response) {
          log('New account created successfully')
          this.closeSpinner()
          this.router.showLogin(
            this.model.get('local') + '@' + this.model.get('domain'),
            this.model.get('password')
          )
        },
      
        accountCreateFail: function(model, response) {
          var error = JSON.parse(response.responseText).error
          var message = ''
          switch (error) {
            case 'local-in-use':
              message = 'Username in use, please try another'
              break
            case 'email-in-use':
              message = 'Email address in use by another account'
              break
            case 'bad-parameters':
              message = 'Bad details provided by app, please refresh and try again'
              break
            default:
            case 'server-error':
              message = 'Whoops! Server error, please try again'
              break
          }
          this.closeSpinner()
          this.showError(message)
          log('Account creation fail', error)
        }
    })

})
