define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Register')
      , ModalView   = require('app/views/Modal')
      , ModalModel  = require('app/models/Modal')
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
          this.modal = new ModalView(options)
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
            self.showError(new ModalModel({
              type: 'error',
              message: 'Registration failed',
              showClose: true
            }))
            self.enableRegisterButton()
          })
        },

        enableRegisterButton: function() {
          this.$el.find('button').attr('disabled', false)
        },

        showError: function(model) {
          this.closeSubView('modal')
          this.modal.model = model
          this.showSubView('modal', this.modal)
          this.modal.on('close', function() {
            this.closeSubView('modal')
          }, this)
        },

        register: function(event) {
          event.preventDefault()
          this.$el.find('button').attr('disabled', 'disabled')
          var local = this.$el.find('input[name="username"]').val()
          var password = this.$el.find('input[name="password"]').val()
          var email = this.$el.find('input[name="email"]').val()
          this.showSpinner()
          var domain = document.location.domain
          if (-1 !== local.indexOf('@')) {
            
          }
          this.model = new Account({
            local: local,
            email: email,
            password: password,
            domain: domain
          })
          this.model.save({ 
            success: _.bind(accountCreated, this),
            error: _.bind(accountCreateFail, this)
          })
        },
      
        accountCreated: function() {
          log('ACCOUNT CREATED', arguments)
        },
      
        accountCreateFail: function() {
          log('ACCOUNT CREATE FAIL', arguments)
        },

        showSpinner: function() {
          log('Showing spinner')
          this.modal.model = new ModalModel({
            type: 'spinner',
            message: 'Registering',
            showClose: false
          })
          this.showSubView('modal', this.modal)
        },
      
        closeSpinner: function() {
          log('Closing spinner')
          this.closeSubView('modal')
        },

    })

})
