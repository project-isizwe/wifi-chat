define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Base       = require('app/views/Base')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:PasswordReset')

    return Base.extend({

        template: _.template(require('text!tpl/PasswordReset.html')),
      
        className: 'passwordReset screen',
      
        title: 'Reset Password'

    })

})
