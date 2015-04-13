define(function(require) {

    'use strict'; 

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , HeaderView     = require('app/views/Topic/Header')
      , NewCommentView = require('app/views/Topic/NewComment')
      , CommentsList   = require('app/views/Topic/CommentList')
      , subscriptions  = require('app/store/Subscriptions')
      , log            = require('bows.min')('Views:Topic:Index')

    return Base.extend({

      requiresLogin: true,

      className: 'topic screen',

      postingAffiliations: [
        'publisher',
        'moderator',
        'owner'
      ],


      initialize: function(options) {
        this.router = options.router
        this.options = options

        _.bindAll(this, 'render')
        this.determineCommentAbility()
      },

      determineCommentAbility: function() {
        this.subscription = subscriptions
          .findWhere({ node: '/user/' + this.options.channelJid + '/posts' })
        if (!this.subscription) {
          subscriptions.on('change', this.affiliationsUpdated, this)
        } else {
          this.updateCanComment()
        }
      },

      affiliationsUpdated: function() {
        log('Affiliations updated, checking ability to comment')
        this.subscription = subscriptions
          .findWhere({ node: '/user/' + this.options.channelJid + '/posts' })
        var isCommentor = this.canComment
        this.updateCanComment()
        if (this.canComment !== isCommentor) {
          this.render()
        }
      },

      updateCanComment: function() {
        var canComment = true
        var affilition = this.subscription.get('affiliation')
        if (-1 === this.postingAffiliations.indexOf(affilition)) {
          canComment = false
        }
        this.canComment = canComment
      },

      beforeRender: function() {
        if (this.header) {
          return
        }
        this.options.node = '/user/' +
          this.options.channelJid +
          '/posts'
        this.header = new HeaderView(this.options)
        this.commentList = new CommentsList(this.options)

        this.newComment = new NewCommentView(this.options)
        this.newComment.on('publish:error', this.showPublishError, this)

        this.commentList.once('loaded:comments', function() {
          if (this.canComment) {
            this.newComment.trigger('loaded:comments')
          }
        }, this)
      },

      showPublishError: function(error) {
        var message = 'Oh no! There was a problem publishing your comment.'
        switch (error.condition) {
          case 'forbidden':
            message = 'We\'re sorry, you don\'t have permission to comment here'
            break
        }
        this.showError(message)
      },
      
      render: function() {
        this.beforeRender()
        this.$el.append(this.header.render().el)
        this.$el.append(this.commentList.render().el)
        if (this.canComment) {
          this.$el.append(this.newComment.render().el)
        }
        this.trigger('render')
        return this
      }

    })

})
