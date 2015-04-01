define(function(require) {

    'use strict';

    var $          = require('jquery')
      , Backbone   = require('backbone')
      , _          = require('underscore')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Modal')

    return Backbone.View.extend({

      template: _.template(require('text!tpl/Modal.html')),

      className: 'modal',

      events: {
        'click .js-close': 'close'
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
      },

      closeView: function() {
        this.stopListening()
        this.remove()
      }

    })

})
