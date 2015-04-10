define(function(require) {

    'use strict';

    var _               = require('underscore')
      , Base            = require('app/views/Base')
      , Comments        = require('app/collections/Comments')
      , CommentItemView = require('app/views/Topic/CommentItem')
      , log             = require('app/utils/bows.min')('Views:Topic:CommentList')

    return Base.extend({

      template: _.template(require('text!tpl/Topic/CommentList.html')),

      requiresLogin: true,

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
        this.collection.sync()
      },

      addComments: function(length) {
        var newComments = this.collection.models.slice(-length)
        log(length, 'new comments')
        var comments = document.createDocumentFragment()
        var self = this

        for(var i=0, l=newComments.length; i<l; i++){
          var comment = new CommentItemView({
            model: newComments[i],
            router: self.router
          })
          comments.appendChild(comment.render().el)
        }
        this.$el.find('[data-role=posts-container]').prepend(comments)

        if (this.collection.allItemsLoaded()) {
          this.$el.find('.js-showMore').remove()
        } else {
          this.isFetchingComments = false
          this.$el.find('.js-showMore').removeClass('is-loading')
        }
      },

      loadMoreComments: function() {
        if(this.isFetchingComments)
          return

        this.isFetchingComments = true
        this.$el.find('.js-showMoreHolder').addClass('is-loading')
        this.collection.sync()
      }
    })

})
