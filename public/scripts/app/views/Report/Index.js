define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , Report           = require('app/models/Report')
      , ReportMap        = require('app/views/Report/Map')
      , log              = require('bows.min')('Views:Report:Index')

    return Base.extend({

      template: _.template(require('text!tpl/Report/Index.html')),

      requiresLogin: true,

      title: 'Report',

      events: {
        'click .js-category': 'pickCategory'
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
        var locationView = new ReportMap({ router: this.router, model: this.model })
        this.router.showView(locationView, 'report/location')
      }

    })

})
