define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , log            = require('app/utils/bows.min')('Views:TopicItem')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Channel/TopicItem.html')),
      
        requiresLogin: true,

        tagName: 'section',

        className: 'post post--topic',

        events: {
          'click .js-seeAuthor': 'seeAuthor',
          'click .js-comment': 'addComment',
        },

        initialize: function(options) {
          _.bindAll(this, 'render')
          this.model.bind('change', this.render)
          this.on('render', this.afterRender, this)
        },
      
        afterRender: function() {
          this.$el.find('time').timeago()
        },

        addComment: function() {
          // view topic and focus on new comment input
          this.options.router.showTopic(this.model.get('channelJid'), this.model.get('id'), true)
        },

        seeAuthor: function() {
          this.options.router.showProfile(this.model.get('username'))
        },
      
    })

})
