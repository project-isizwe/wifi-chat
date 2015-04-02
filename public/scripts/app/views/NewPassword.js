define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , log         = require('app/utils/bows.min')('Views:NewPassword')
      , NewPassword = require('app/models/NewPassword')

    return Base.extend({

        events: {
          'submit': 'newPassword'
        },
      
        template: _.template(require('text!tpl/NewPassword.html')),
      
        className: 'newPassword screen',
      
        title: 'Set A New Password',
      
        
        newPassword: function(event) {
          event.preventDefault()
          
          var newPassword = (this.$el.find('#new-password-1').val() || '').trim()
          var passwordConfirm = (this.$el.find('#new-password-2').val() || '')
            .trim()
          
          if (newPassword.length < 6) {
            return this.showError('Passwords must be 6 characters or more')
          }
          if (newPassword !== passwordConfirm) {
            return this.showError('Passwords must match')
          }
          
          this.$el.find('button').attr('disabled', 'disabled')
          
          this.showSpinner('Setting new password')
          this.model.urlRoot = '/account/reset/' + this.options.token
          this.model = new NewPassword({
            password: password
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
