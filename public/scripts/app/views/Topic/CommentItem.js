define(function(require) {

    'use strict';

    var _       = require('underscore')
      , Avatar  = require('app/models/Avatar')
      , Base    = require('app/views/Base')
      , user    = require('app/store/User')
      , config  = require('app/utils/config')
      , log     = require('bows.min')('Views:Topic/CommentList')
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
        },

        render: function(){
          this.$el.html(this.template(_.extend(this.model.attributes, {
            avatarUrl: this.avatar && this.avatar.get('url'),
            maxHeight: this.seeMoreCutoff.height + this.seeMoreCutoff.tolerance
          })))
          this.$el.find('time').timeago()

          if(!this.avatar)
            this.loadAvatar()

          this.limitHeight()

          return this
        },

        seeAuthor: function() {
          this.router.showProfile(this.model.get('authorJid'))
        },
        
        loadAvatar: function() {
          this.avatar = new Avatar({ jid: this.model.get('authorJid') })
          this.avatar.once('loaded:avatar', this.showAvatar, this)
        },

        showAvatar: function() {
          this.$el.find('.avatar')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')      
        },

        reportPost: function() {
          document.location.href = this.getReportedPostContent()
        },

        getReportedPostContent: function() {
          var subject = 'Reported post from WiFi Chat'
          var name

          if (user.get('displayName')) {
            name = user.get('displayName') + "-" + user.get('channelJid')
          } else {
            name = user.get('channelJid')
          }

          var body = [
            'Reported by: '+ name,
            'Reason: \n\n*** Please add a reason here ***\n\n',
            'Post ID: ' + this.model.get('globalId'),
            'Post content:\n\n' + this.model.get('content') + '\n\n',

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
