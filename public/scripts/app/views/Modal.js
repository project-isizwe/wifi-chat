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
        'click .js-close': 'close'
      },
      
      initialize: function(options) {
        this.options = options
        this.router = options.router
      },
      
      render: function() {
        if (!this.model.has('message')) {
          this.model.set('message', 'Error')
        }
        this.$el.html(this.template(this.model.toJSON()))
        return this
      },

      close: function(event) {
        event.preventDefault()
        event.stopPropagation()
        if (this.model.get('showClose')) {
          this.trigger('close')
        }
      }

    })

})
