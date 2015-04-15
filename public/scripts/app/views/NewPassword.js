define(function(require) {

    'use strict';

    var $           = require('jquery')
      , _           = require('underscore')
      , Base        = require('app/views/Base')
      , log         = require('bows.min')('Views:NewPassword')
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
          
          var newPassword = (this.$el.find('#reset-password-1').val() || '').trim()
          var passwordConfirm = (this.$el.find('#reset-password-2').val() || '')
            .trim()
          
          if (newPassword.length < 6) {
            return this.showError('Passwords must be 6 characters or more')
          }
          if (newPassword !== passwordConfirm) {
            return this.showError('Passwords must match')
          }
          
          this.$el.find('button').attr('disabled', 'disabled')
          
          this.showSpinner('Setting new password')
          this.model = new NewPassword({
            password: newPassword
          })
          this.model.urlRoot = '/account/reset/' + this.options.token
          this.model.save(null, { 
            success: _.bind(this.passwordReset, this),
            error: _.bind(this.passwordResetFailed, this)
          })
        
        },
      
        passwordReset: function() {
          var modal = this.showMessage(
            'Success! Your password has been reset'
          )
          localStorage.setItem('password', this.model.get('password'))
          modal.once('close', function() {
            this.router.setLastRoute('showHome').showHome()
          }, this)
          this.$el.find('button').attr('disabled', false)
        },
      
        passwordResetFailed: function(error) {
          var message = 'Password reset failed, please try again'
          if (error.error === 'token-not-found') {
            message = 'Password reset token not found'
          }
          this.showError(message)
          this.$el.find('button').attr('disabled', false)
        }

    })

})
