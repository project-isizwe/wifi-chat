define(function(require) {

    'use strict';

    var _          = require('underscore')
      , Base       = require('app/views/Base')
      , log        = require('app/utils/bows.min')('Views:Spinner')

    return Base.extend({

        requiresLogin: false,
      
        className: 'modal-content',
      
        template: _.template(require('text!tpl/Spinner.html'))

    })

})
