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
        'js-close': 'close'
      },
      
      initialize: function(options) {
        this.options = options
        this.router = options.router
        this.spinnerView = new SpinnerView()
      },
      
      render: function() {
        this.$el.html(this.template, this.model)
        log(this.model)
        if (this.model && ('spinner' === this.model.get('type'))) {
          this.$el.find('.modal-body').html(this.spinnerView.render().$el)
          log('Loading spinner content')
        }
        return this
      },

      close: function(event) {
        event.preventDefault()
        // fire close event
        // destroy
      }

    })

})
