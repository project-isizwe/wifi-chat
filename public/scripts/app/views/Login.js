define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Login')
      , ModalView   = require('app/views/Modal')
      , Spinner     = require('app/models/Spinner')
      , Error       = require('app/models/Error')

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
        },
      
        registerEvents: function() {
          var self = this
          socket.on('xmpp.connection', function(data) {
            log('Connected as', data.jid)
            self.performDiscovery()
          })
          socket.on('xmpp.error', function(error) {
            log('Login failed', error)
            self.showError(error)
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
            self.closeSpinner()
            log('Discovery response', error, server)
            if (error) {
              self.enableLoginButton()
              self.showError(error)
              return alert('DISCOVERY ERROR', error)
            }
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
        },
      
        showSpinner: function() {
          log('Showing spinner')
          this.modal.model = new Spinner()
          this.showSubView('modal', this.modal)
        },
      
        closeSpinner: function() {
          log('Closing spinner')
      //    this.closeSubView('modal')
        },
      
        showError: function() {
          this.closeSpinner()
        }

    })

})
