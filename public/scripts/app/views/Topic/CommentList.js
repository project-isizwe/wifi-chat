define(function(require) {

    'use strict';

    var _               = require('underscore')
      , Base            = require('app/views/Base')
      , Comments        = require('app/collections/Comments')
      , CommentItemView = require('app/views/Topic/CommentItem')
      , log             = require('bows.min')('Views:Topic:CommentList')

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
          id: this.options.id
        })
        this.loadComments()
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
        log(arguments, model)
        this.addComments(model)
      },

      addComments: function(length) {
        var newComments =  null
        var addMethod = 'prepend'
        if (length instanceof Backbone.Model) {
          newComments = [ length ]
          addMethod = 'append'
        } else {
          newComments = this.collection.models.slice(0, length)
          log(length + ' new comments')
        }
        var comments = document.createDocumentFragment()
        var self = this

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
      },

      loadMoreComments: function() {
        if (this.isFetchingComments) {
          return
        }

        this.isFetchingComments = true
        this.$el.find('.js-showMoreHolder').addClass('is-loading')
        this.collection.sync()
      }
    })

})
