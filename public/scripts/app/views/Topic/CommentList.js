define(function(require) {

    'use strict';

    var _               = require('underscore')
      , Base            = require('app/views/Base')
      , Comments        = require('app/collections/Comments')
      , CommentItemView = require('app/views/Topic/CommentItem')
      , Post            = require('app/models/Post')
      , log             = require('bows.min')('Views:Topic:CommentList')
      require('jquery.scrollparent')

    return Base.extend({

      template: _.template(require('text!tpl/Topic/CommentList.html')),

      requiresLogin: true,

      className: 'posts',

      tagName: 'section',

      events: {
        'click .js-showMore': 'loadMoreComments'
      },

      initialize: function(options) {
        _.bindAll('render')
        this.options = options
        this.router = options.router
        this.collection = new Comments(null, {
          node: this.options.node,
          id: this.options.id,
          after: options.highlightPost
        })
        if (this.options.highlightPost) {
          this.collection.once('loaded:comments', this.loadHighlightedPost, this)
        }
        this.loadComments()
      },

      loadHighlightedPost: function() {
        var post = new Post({
          id: this.options.highlightPost,
          node: this.options.node
        })
        post.once('loaded:post', function() {
          this.collection.add(post, { silent: true })
          this.addComments(post, true)
          this.collection.lastItemId 
        }, this)
        post.sync()
      },

      loadComments: function() {
        this.collection.on('all', function(event) { log('TopicList', event) })
        this.collection.on('loaded:comments', this.addComments, this)

        /* focus on newComment has to wait for this */
        this.collection.once('loaded:comments', function(){
          this.trigger('loaded:comments')
        }, this)

        this.collection.on('error', function() {
          this.renderComments()
          this.enableLoadMoreButton()
          this.showError('Oh no! Could not load the comments')
        }, this)

        if (0 !== this.collection.length) {
          return this.once('render', this.renderComments, this)
        }
        this.collection.on('add', this.pushedItem, this)
        this.collection.sync()
      },

      pushedItem: function(model) {
        this.addComments(model)
      },

      addComments: function(length, prepend) {
        var newComments =  null
        var addMethod = 'prepend'
        if (length instanceof Backbone.Model) {
          newComments = [ length ]
          if (!prepend) {
            addMethod = 'append'
          }
        } else {
          newComments = this.collection.models.slice(-length)
          log(length + ' new comments')
        }
        var comments = document.createDocumentFragment()
        var self = this
        var scrollParent = this.$el.scrollParent()

        var scrollHeight = (scrollParent.get(0) == document ? $('body') : scrollParent).prop('scrollHeight')
        var viewHeight = (scrollParent.get(0) == document ? $(window) : scrollParent).outerHeight()
        var isScrolledToBottom = Math.abs(scrollHeight - scrollParent.scrollTop() - viewHeight) < 5

        newComments.forEach(function(newComment) {
          var comment = new CommentItemView({
            model: newComment,
            router: self.router
          })
          comments.appendChild(comment.render().el)
        }, this)

        if (addMethod == 'prepend') {
          this.$el.find('.js-showMore').after(comments)
        } else {
          this.$el.append(comments)
        }

        if (this.collection.allItemsLoaded()) {
          return this.$el.find('.js-showMore').remove()
        }

        this.isFetchingComments = false
        this.$el.find('.js-showMore').removeClass('is-loading')    

        if (isScrolledToBottom) {
          scrollParent.scrollTop(999999)
        }
      },

      loadMoreComments: function() {
        if (this.isFetchingComments) {
          return
        }

        this.isFetchingComments = true
        this.$el.find('.js-showMore').addClass('is-loading')
        this.collection.sync()
      }
    })

})
