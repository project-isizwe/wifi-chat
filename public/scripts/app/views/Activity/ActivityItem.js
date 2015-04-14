define(function(require) {

    'use strict';

    var _             = require('underscore')
      , Avatar        = require('app/models/Avatar')
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
        },

        render: function(){
          this.$el.html(this.template(_.extend(this.model.attributes, {
            userAvatarUrl: this.userAvatar && this.userAvatar.get('url'),
            postedIn: this.channel.isLoaded() ? this.getPostedInTemplate() : null,
            maxHeight: this.seeMoreCutoff.height + this.seeMoreCutoff.tolerance
          })))
          this.$el.find('time').timeago()

          if(!this.userAvatar)
            this.loadUserAvatar()

          if(this.channel.isLoaded() && !this.channelAvatar)
            this.loadChannelAvatar()

          this.limitHeight()

          return this
        },

        showPostedIn: function() {
          this.$el.find('.js-postHeader').append(this.getPostedInTemplate())

          if(!this.channelAvatar)
            this.loadChannelAvatar()
        },

        getPostedInTemplate: function() {
          return this.postedInTemplate({
            channelAvatarUrl: this.channelAvatar && this.channelAvatar.get('url'),
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

        loadChannelAvatar: function() {
          this.channelAvatar = new Avatar({ jid: this.channel.get('channelJid') })
          this.channelAvatar.once('loaded:avatar', this.showChannelAvatar, this)
        },

        showChannelAvatar: function() {
          this.$el.find('.js-channelAvatar')
            .css('background-image', 'url("' + this.channelAvatar.get('url') + '")')      
        },

        loadUserAvatar: function() {
          this.userAvatar = new Avatar({ jid: this.model.get('username') })
          this.userAvatar.once('loaded:avatar', this.showUserAvatar, this)
        },

        showUserAvatar: function() {
          this.$el.find('.js-userAvatar')
            .css('background-image', 'url("' + this.userAvatar.get('url') + '")')      
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
