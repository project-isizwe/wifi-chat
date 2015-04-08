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

      className: 'channel screen',
      
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
      }, 
      
      render: function() {
        this.beforeRender()
        this.$el.html(this.template())
        this.$el.find('div[data-role="header"]').html(this.header.render().el)
        this.$el.find('main').html(this.commentList.render().el)
        this.$el.find('form').html(this.newComment.render().el)
        this.trigger('render')
        return this
      }

    })

})
