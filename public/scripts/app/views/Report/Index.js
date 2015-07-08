define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , Report           = require('app/models/Report')
      , log              = require('bows.min')('Views:Report:Index')

    return Base.extend({

      template: _.template(require('text!tpl/Report/Index.html')),

      requiresLogin: true,

      title: 'Report',

      events: {
        'click .js-category': 'pickCategory',
        'click .js-emergency': 'emergency'
      },

      className: 'tab-views-item report',

      attributes: {
        'data-view': 'report'
      },

      initialize: function(options) {
        this.options = options
        this.router = options.router
        this.model = new Report()
        this.on('visibilitychange', this.onVisibilityChange, this)
      },

      pickCategory: function(event) {
        this.model.set('category', $(event.currentTarget).attr('data-category'))
        this.router.showReportLocation(this.model)
      },

      emergency: function() {
        this.router.showEmergencyNumber()
      }

    })

})
