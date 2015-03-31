define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Backbone   = require('backbone')
      , tpl        = require('text!tpl/Modal.html')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Modal')
      , template   = _.template(tpl)

    return Backbone.View.extend({

        className: 'modal',

        initialize: function (options) {
          this.render()
        },

        render: function () {
          // hand over options.tmpl to render inside of modal-content
          this.$el.html(template())
          return this
        },

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
