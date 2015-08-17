define(function(require) {

    'use strict';

    var _                 = require('underscore')
      , Base              = require('app/views/Base')
      , Report            = require('app/models/Report')
      , SubcategoriesView = require('app/views/Report/Subcategories')
      , log               = require('bows.min')('Views:Report:Index')

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
        this.router = options.router
        this.model = new Report()
        this.on('visibilitychange', this.onVisibilityChange, this)
      },

      pickCategory: function(event) {
        var quad = $(event.currentTarget)
        this.model.set('category', quad.attr('data-category'))

        if (quad.hasClass('js-hasSubcategory')) {
          if (quad.hasClass('is-selected')) {
            this.hideSubcategories()
          } else {
            this.showSubcategories(quad)
          }
        } else {
          this.router.showReportLocation(this.model)
        }
      },

      showSubcategories: function(quad) {
        this.selectedQuad = quad
        this.subcategoryView = new SubcategoriesView({
          router: this.router,
          model: this.model,
          quad: this.selectedQuad
        })
        this.subcategoryView.on('hide', this.hideSubcategories, this)
        this.selectedQuad.addClass('is-selected')

        this.$('.js-grid').append(this.subcategoryView.el)
        this.subcategoryView.render()
      },

      hideSubcategories: function() {
        log(this.subcategoryView)
        this.subcategoryView.el.remove()
        this.selectedQuad.removeClass('is-selected')
        this.selectedQuad = null
      },

      emergency: function() {
        this.router.showEmergencyNumber()
      }

    })

})
