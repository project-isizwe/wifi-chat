define(function(require) {

    'use strict';

    var _        = require('underscore')
      , Avatars  = require('app/store/Avatars')
      , Base     = require('app/views/Base')
      , user     = require('app/store/User')
      , config   = require('app/utils/config')
      , log      = require('bows.min')('Views:Topic/CommentList')
      , channels = require('app/store/Channels')
      , Channel  = require('app/models/Channel')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Topic/CommentItem.html')),
        seeMoreTemplate: _.template(require('text!tpl/SeeMore.html')),
      
        requiresLogin: true,

        tagName: 'article',

        seeMoreCutoff: {
          height: 300,
          tolerance: 50
        },

        attributes: function() {
          return {
            'data-id': this.model.get('localId'),
            'class': 'post post--comment' +
              (this.model.get('highlight') ? ' is-highlighted' : '')
          }
        },

        events: {
          'click .js-seeAuthor': 'seeAuthor',
          'click .js-report-post': 'reportPost'
        },

        initialize: function(options) {
          _.bindAll(this, 'render')

          this.options = options
          this.router = options.router
          this.model.bind('change', this.render)
          this.avatar = Avatars.getAvatar({ jid: this.model.get('authorJid') })
          this.avatar.on('change:url', this.renderAvatar, this)
        },

        render: function(){
          this.$el.html(this.template(_.extend(this.model.attributes, {
            avatarUrl: this.avatar.getUrl(),
            maxHeight: this.seeMoreCutoff.height + this.seeMoreCutoff.tolerance
          })))
          this.$el.find('time').timeago()

          this.loadDisplayName()

          this.limitHeight()

          return this
        },

        loadDisplayName: function() {
          if (this.model.get('displayName')) {
            return
          }
          var authorNode = '/user/' + this.model.get('authorJid') + '/posts'
          var channel = channels.findWhere({ node: authorNode })
          if (!channel) {
            channel = new Channel({ node: authorNode })
            channels.add(channel)
            channel.once('loaded:meta', this.loadDisplayName, this)
            return
          }
          if (channel.get('displayName')) {
            return this.model.set('displayName', channel.get('displayName'))
          }
          channel.once('change:displayName', this.loadDisplayName, this)
        },

        seeAuthor: function() {
          this.router.showProfile(this.model.get('authorJid'))
        },

        renderAvatar: function() {
          this.$el.find('.avatar')
            .css('background-image', 'url("' + this.avatar.getUrl() + '")')      
        },

        reportPost: function() {
          document.location.href = this.getReportedPostContent()
        },

        getReportedPostContent: function() {
          var subject = 'Reported post from WiFi Chat'
          var name

          if (user.get('displayName')) {
            name = user.get('displayName') + "-" + user.get('username')
          } else {
            name = user.get('username')
          }

          var body = [
            'Post ID: ' + this.model.get('globalId'),
            'Post content: ' + this.model.get('content'),
            'Reported by: '+ name,
            'Reason: ',

          ]
          return encodeURI(
            'mailto:' + config.reportingAddress +
            '?subject=' + subject +
            '&body=' + body.join('\n')
          )

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
