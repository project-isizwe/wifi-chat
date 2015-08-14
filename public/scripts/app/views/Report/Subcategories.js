define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , log              = require('bows.min')('Views:Report:Subcategories')

    return Base.extend({

      template: _.template(require('text!tpl/Report/Subcategories.html')),

      requiresLogin: true,

      events: {
        'click .js-category': 'pickCategory',
        'click': 'hide'
      },

      className: 'quad-select-overlay',

      initialize: function(options) {
        this.router = options.router
        this.model = options.model
        this.quad = options.quad
      },

      beforeRender: function() {
        var baseMargin = parseInt(this.quad.css('margin-top'), 10)
        var y = baseMargin*3 + this.quad.position().top + this.quad.outerHeight()
        this.$el.css({
          paddingTop: y,
          minHeight: this.quad.parents('.js-reportViewBase').outerHeight()
        })
      },

      hide: function(event) {
        this.trigger('hide')
      },

      pickCategory: function(event) {
        event.stopPropagation()
        this.model.set('subcategory', $(event.currentTarget).attr('data-subcategory'))
        this.router.showReportLocation(this.model)
        this.trigger('hide')
      }

    })

})
