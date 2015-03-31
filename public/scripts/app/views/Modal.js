define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Base       = require('app/views/Base')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Modal')

    return Base.extend({

        template: _.template(require('text!tpl/Modal.html')),
      
        className: 'modal',

        events: {
          'js-close': 'close'
        },

        close: function(event) {
          event.preventDefault()
          // fire close event
          // destroy
        }

    })

})
