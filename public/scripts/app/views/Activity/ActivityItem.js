define(function(require) {

    'use strict';

    var _             = require('underscore')
      , Avatars       = require('app/store/Avatars')
      , Channel       = require('app/models/Channel')
      , subscriptions = require('app/store/Subscriptions')
      , Base          = require('app/views/Base')
      , log           = require('bows.min')('Views:ActivityItem')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Activity/ActivityItem.html')),
        postedInTemplate: _.template(require('text!tpl/Activity/ActivityItem-postedIn.html')),
        seeMoreTemplate: _.template(require('text!tpl/SeeMore.html')),
      
        requiresLogin: true,

        tagName: 'article',

        className: 'post post--activity',

        seeMoreCutoff: {
          height: 300,
          tolerance: 50
        },

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

          this.channel = new Channel({ node: this.model.get('node') })
          this.channel.once('loaded:meta', this.showPostedIn, this)

          this.userAvatar = Avatars.getAvatar({ jid: this.model.get('authorJid') })
          this.userAvatar.on('change:url', this.renderUserAvatar, this)
        },

        render: function(){
          this.$el.html(this.template(_.extend(this.model.attributes, {
            userAvatarUrl: this.userAvatar.getUrl(),
            postedIn: this.channel.isLoaded() ? this.getPostedInTemplate() : null,
            maxHeight: this.seeMoreCutoff.height + this.seeMoreCutoff.tolerance
          })))
          this.$el.find('time').timeago()

          this.limitHeight()

          return this
        },

        showPostedIn: function() {
          this.$el.find('.js-postHeader').append(this.getPostedInTemplate())

          if(!this.channelAvatar)
            this.loadChannelAvatar()
        },

        getPostedInTemplate: function() {
          this.channelAvatar = Avatars.getAvatar({ jid: this.channel.get('channelJid') })
          this.channelAvatar.on('change:url', this.renderChannelAvatar, this)

          return this.postedInTemplate({
            channelAvatarUrl: this.channelAvatar.getUrl(),
            channelTitle: this.channel.get('title')
          })
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
          this.router.showChannel(this.channel.get('channelJid'))
        },

        renderChannelAvatar: function() {
          this.$el.find('.js-channelAvatar')
            .css('background-image', 'url("' + this.channelAvatar.getUrl() + '")')      
        },

        renderUserAvatar: function() {
          this.$el.find('.js-userAvatar')
            .css('background-image', 'url("' + this.userAvatar.getUrl() + '")')      
        },

        limitHeight: function() {
          var target = this.$el.find('.js-limitHeight')

          if (target.height() !== this.seeMoreCutoff.height + this.seeMoreCutoff.tolerance) {
            return
          }

          target
            .css({
              height: this.seeMoreCutoff.height,
              maxHeight: ''
            })
            .append(this.seeMoreTemplate())
            .find('.js-seeMore').one('click', function(){
              target.css({
                height: ''
              })
              this.remove()
            })
        },
    })

})
