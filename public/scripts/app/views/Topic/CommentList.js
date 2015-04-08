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

      initialize: function(options) {

        this.options = options
        this.router = options.router
        this.collection = new Comments(null, {
          channelJid: this.options.channelJid
        })
        this.collection.on('all', function(event) { log('TopicList', event) })
        this.collection.once('loaded:topics', this.initialRender, this)

        this.collection.on('error', function() {
          this.renderComments()
          this.showError('Oh no! Could not load topics')
        }, this)

        if (0 !== this.collection.length) {
          return this.once('render', this.renderComments, this)
        }
        this.collection.sync()
      },

      initialRender: function() {
        this.renderComments()
        this.collection.on('add', this.renderComments, this)
        this.collection.on('reset', this.renderComments, this)
        this.collection.on('remove', this.renderComments, this)
      },

      renderComments: function() {
        var comments = document.createDocumentFragment()
        var self = this

        this.collection.forEach(function(post) {
          var comment = new CommentItemView({
            model: post,
            router: self.router
          })
          comments.appendChild(comment.render().el)
        })
        this.$el.html(topics)
      }
    })

})
