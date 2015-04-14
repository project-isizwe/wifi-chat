define(function(require) {

    'use strict';

    var _       = require('underscore')
      , Avatar  = require('app/models/Avatar')
      , Base    = require('app/views/Base')
      , log     = require('bows.min')('Views:ActivityItem')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Activity/ActivityItem.html')),
      
        requiresLogin: true,

        tagName: 'article',

        className: 'post post--activity',

        events: {
          'click .js-seeAuthor': 'seeAuthor',
          'click .js-seeChannel': 'seeChannel',
          'click .js-context': 'seeContext',
        },

        initialize: function(options) {
          _.bindAll(this, 'render')

          this.options = options
          this.router = options.router
          this.model.bind('change', this.render)
        },

        render: function(){
          this.$el.html(this.template(_.extend(this.model.attributes, {
            userAvatarUrl: this.avatar && this.avatar.get('url'),
          })))
          this.$el.find('time').timeago()

          if(!this.avatar)
            this.loadAvatar()

          return this
        },

        seeContext: function() {
          this.router.showTopicContext(
            this.model.get('channelJid'),
            this.model.get('inReplyTo'), 
            this.model.get('localId')
          )
        },

        seeAuthor: function() {
          this.router.showProfile(this.model.get('username'))
        },

        seeChannel: function() {
          
        },

        loadAvatar: function() {
          this.avatar = new Avatar({ jid: this.model.get('username') })
          this.avatar.once('loaded:avatar', this.showAvatar, this)
        },

        showAvatar: function() {
          this.$el.find('.js-userAvatar')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')      
        },
    })

})
