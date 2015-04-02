define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Base       = require('app/views/Base')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:PasswordReset')
      , Account    = require('app/models/PasswordReset')

    return Base.extend({

        events: {
          'submit': 'resetPassword'
        },
      
        template: _.template(require('text!tpl/PasswordReset.html')),
      
        className: 'passwordReset screen',
      
        title: 'Reset Password',
      
        resetPassword: function(event) {
          event.preventDefault()
          this.$el.find('button').attr('disabled', 'disabled')
          var email = (this.$el.find('input[type="email"]').val() || '').trim()
          if (email.length < 4) {
            return this.showError('Invalid email address entered')
          }
          this.showSpinner('Requesting password reset')
          this.model = new Account({
            email: email
          })

          this.model.save(null, { 
            success: _.bind(this.passwordReset, this),
            error: _.bind(this.passwordResetFailed, this)
          })
        
        },
      
        passwordReset: function() {
          this.showMessage(
            'Success! If your address was registered with the ' +
            'system you will receive an email very soon'
          )
          this.$el.find('button').attr('disabled', false)
        },
      
        passwordResetFailed: function(error) {
          this.showError('Password reset failed, please try again')
          this.$el.find('button').attr('disabled', false)
        }

    })

})
