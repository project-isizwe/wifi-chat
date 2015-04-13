define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , Avatar         = require('app/models/Avatar')
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
          this.options = options
          this.model.bind('change', this.render)
        },

        render: function(){
          this.$el.html(this.template(_.extend(this.model.attributes, {
            avatarUrl: this.avatar && this.avatar.get('url')
          })))
          this.$el.find('time').timeago()

          if(!this.avatar)
            this.loadAvatar()

          return this
        },

        addComment: function() {
          // view topic and focus on new comment input
          this.options.router.showTopic(this.model.get('channelJid'), this.model.get('id'), true)
        },

        seeAuthor: function() {
          this.options.router.showProfile(this.model.get('username'))
        },

        loadAvatar: function() {
          this.avatar = new Avatar({ jid: this.model.get('username') })
          this.avatar.once('loaded:avatar', this.showAvatar, this)
        },

        showAvatar: function() {
          this.$el.find('.avatar')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')      
        },
      
    })

})
