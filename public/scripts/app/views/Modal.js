define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Base       = require('app/views/Base')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Modal')
      , SpinnerView = require('app/views/Spinner')

    return Base.extend({

      template: _.template(require('text!tpl/Modal.html')),

      className: 'modal',

      events: {
        'click div': 'close'
      },
      
      initialize: function(options) {
        this.options = options
        this.router = options.router
        this.spinnerView = new SpinnerView()
      },
      
      render: function() {
        if (!this.model.has('message')) {
          this.model.set('message', 'Error')
        }
        this.$el.html(this.template(this.model.toJSON()))
        if ('spinner' === this.model.get('type')) {
          this.$el.find('.modal-body').html(this.spinnerView.render().$el)
        }
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
