define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , Avatar         = require('app/models/Avatar')
      , subscriptions  = require('app/store/Subscriptions')
      , log            = require('bows.min')('Views:TopicItem')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Channel/TopicItem.html')),
        seeMoreTemplate: _.template(require('text!tpl/SeeMore.html')),
      
        requiresLogin: true,

        tagName: 'section',

        className: 'post post--topic',

        seeMoreCutoff: {
          height: 300,
          tolerance: 50
        },

        events: {
          'click .js-seeAuthor': 'seeAuthor',
          'click .js-comment': 'addComment',
        },

        postingAffiliations: [
          'publisher',
          'moderator',
          'owner'
        ],

        initialize: function(options) {
          _.bindAll(this, 'render')
          this.options = options
          this.model.bind('change', this.render)

          this.determineCommentAbility()
        },

        determineCommentAbility: function() {
          var subscription = subscriptions.findWhere({ node: this.model.get('node')})
          var canComment = true
          if (-1 === this.postingAffiliations.indexOf(subscription.get('affiliation'))) {
            canComment = false
          }
          this.model.set('canComment', canComment, { silent: true })
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

        addComment: function() {
          // view topic and focus on new comment input
          this.options.router.showTopic(this.model.get('channelJid'), this.model.get('localId'), true)
        },

        seeAuthor: function() {
          this.options.router.showProfile(this.model.get('authorJid'))
        },

        loadAvatar: function() {
          this.avatar = new Avatar({ jid: this.model.get('authorJid') })
          this.avatar.once('loaded:avatar', this.showAvatar, this)
        },

        showAvatar: function() {
          this.$el.find('.avatar')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')      
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
