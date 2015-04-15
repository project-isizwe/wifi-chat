define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , log         = require('bows.min')('Views:Register')
      , Account     = require('app/models/Account')
      , config      = require('app/utils/config')

    return Base.extend({

        template: _.template(require('text!tpl/Signup.html')),
      
        className: 'signup screen',
      
        title: 'Signup',

        events: {
          'submit': 'register',
          'blur input': 'inidicateValidation',
          'keyup input[name=username]': 'lowerCase',
          'paste input[name=username]': 'lowerCase',
        },

        inidicateValidation: function(event) {
          // add a nonEmpty class when the input is non-empty
          $(event.currentTarget).toggleClass(
            'nonEmpty',
            (event.currentTarget.value !== '')
          )
        },

        enableRegisterButton: function() {
          this.$el.find('button').attr('disabled', false)
        },

        addDomainIfRequired: function(jid) {
          var username = this.$el.find('input[name="username"]')
          if (-1 === username.val().indexOf('@')) {
            jid = jid + '@' + config.domain
          }
          return jid
        },

        register: function(event) {
          event.preventDefault()
          this.$el.find('button').attr('disabled', 'disabled')
          var local = this.addDomainIfRequired(
            this.$el.find('input[name="username"]')
              .val()
              .toLowerCase()
          )
          var password = this.$el.find('input[name="password"]').val()
          var email = this.$el.find('input[name="email"]')
            .val()
            .toLowerCase()
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
        
        lowerCase: function(event) {
          if (this.isCharacterKeyPress(event)) {
            event.target.value = event.target.value.toLowerCase()
          }
        },

        isCharacterKeyPress: function(evt) {
          if (typeof evt.which == "undefined") {
            // This is IE, which only fires keypress events for printable keys
            return true;
          } else if (typeof evt.which == "number" && evt.which > 0) {
            // In other browsers except old versions of WebKit, evt.which is
            // only greater than zero if the keypress is a printable key.
            // We need to filter out backspace and ctrl/alt/meta key combinations
            return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which != 8;
          }
          return false;
        },
      
        accountCreated: function(model, response) {
          log('New account created successfully')
          var self = this
          var jid = this.model.get('local') + '@' + this.model.get('domain')
          localStorage.setItem('wasLoggedInOnce', true)
          localStorage.setItem('jid', jid)
          localStorage.setItem('password', this.model.get('password'))

          this.closeSpinner()
          this.router.setLastRoute('showRules').showLogin()
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
          this.$el.find('input[name="username"]')
            .val(this.model.get('local'))
          this.enableRegisterButton()
          log('Account creation fail', error)
        }
    })

})
