define(function(require) {

    'use strict';

    var _    = require('underscore')
      , Base = require('app/views/Base')
      , log  = require('bows.min')('Views:PostItem')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Activity/ActivityItem.html')),
      
        requiresLogin: true,

        tagName: 'article',

        className: 'post post--comment',

        events: {
          'click .js-context': 'seeContext',
        },

        initialize: function(options) {
          _.bindAll(this, 'render')

          this.options = options
          this.model.bind('change', this.render)
        },

        seeContext: function() {

        },
      
    })

})
