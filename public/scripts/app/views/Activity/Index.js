define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , ActivityItemView = require('app/views/Activity/ActivityItem')
      , log              = require('bows.min')('Views:Activity:Index')

    return Base.extend({

      template: _.template(require('text!tpl/Activity/Index.html')),

      requiresLogin: true,

      title: 'My Posts',

      className: 'tab-views-item activity',

      attributes: {
        'data-view': 'activity'
      },

      initialize: function(options) {
        this.options = options
      },
      
      render: function() {
        this.$el.html(this.template())
        return this
      },

      appendPosts: function() {
        // for each post, append post item
      },

    })

})
