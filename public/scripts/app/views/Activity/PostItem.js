define(function(require) {

    'use strict';

    var _    = require('underscore')
      , Base = require('app/views/Base')
      , log  = require('bows.min')('Views:PostItem')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Channel/PostItem.html')),
      
        requiresLogin: true,

        tagName: 'section',

        className: 'post post--topic',

        events: {
          'click .js-see-thread': 'seeThread',
        },

        initialize: function(options) {
          _.bindAll(this, 'render')
          this.options = options
          this.model.bind('change', this.render)
        }
      
    })

})
