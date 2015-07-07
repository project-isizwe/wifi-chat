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

        className: 'post post--activity',

        events: {
          'click .js-author': 'seeAuthor',
          'click .js-channel': 'seeChannel',
          'click .js-context': 'seeContext',
        },

        initialize: function(options) {
          _.bindAll(this, 'render')

          this.options = options
          this.router = options.router
          this.model.bind('change', this.render)
        },

        seeContext: function() {
          this.router.showTopic(
            this.model.get('channelJid'),
            this.model.get('inReplyTo'), 
            null,
            this.model.get('id')
          )
        },

        seeAuthor: function() {

        },

        seeChannel: function() {
          
        },

        afterRender: function() {
          this.$el.find('time').timeago()
        }
      
    })

})
