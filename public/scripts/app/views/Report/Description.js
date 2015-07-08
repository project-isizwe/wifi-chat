define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , log              = require('bows.min')('Views:Report:Description')

    return Base.extend({

      template: _.template(require('text!tpl/Report/Description.html')),

      requiresLogin: true,

      title: 'Add Description',

      className: 'report screen',

      events: {
        'submit form': 'send',
        'click .js-back': 'back'
      },

      send: function(event) {
        event.preventDefault()
        this.model.set('description', this.$('.js-description').val())
        log("complete:", this.model.attributes)
        // send stuff
      },

      back: function(event) {
        // overwrite the back buttons default behaviour
        // in order to hand over the report state
        event.stopPropagation()
        this.router.showReportLocation(this.model)
      }

    })

})
