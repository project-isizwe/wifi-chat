define(function(require) {

    'use strict'; 

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , HeaderView     = require('app/views/Topic/Header')
      , NewCommentView = require('app/views/Topic/NewComment')
      , CommentsList   = require('app/views/Topic/CommentList')
      , subscriptions  = require('app/store/Subscriptions')
      , log            = require('app/utils/bows.min')('Views:Topic:Index')

    return Base.extend({

      template: _.template(require('text!tpl/Topic/Index.html')),

      requiresLogin: true,

      className: 'topic screen',
      
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
        this.$el.html(this.template())
        this.$el.find('div[data-role="header"]').html(this.header.render().el)
        this.$el.find('main').html(this.commentList.render().el)
        this.$el.find('.js-newComment').html(this.newComment.render().el)
        this.trigger('render')
        return this
      }

    })

})
