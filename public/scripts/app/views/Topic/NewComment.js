define(function(require) {

    'use strict';

    var _     = require('underscore')
      , Base  = require('app/views/Base')
      , Post  = require('app/models/Post')
      , log   = require('app/utils/bows.min')('Views:Topic:NewComment')

    return Base.extend({

    	tagName: 'form',

        template: _.template(require('text!tpl/Topic/NewComment.html')),
      
        requiresLogin: true,

        events: {
        	'submit': 'createPost'
        },

        className: 'writeComment',

        createPost: function(event) {
          event.preventDefault()
          event.stopPropagation()
          var content = this.$el.find('textarea').val()
          if (!content) return
          this.$el.find('button').attr('disabled', 'disabled')
          var post = new Post({
          	content: content,
          	node: this.options.node,
          	inReplyTo: this.options.id
          })
          post.once('publish:success', this.success, this)
          post.once('publish:error', this.publishError, this)
          post.save()
        },

        enableButton: function() {
        	this.$el.find('button').attr('disabled', false)
        },

        clearContent: function() {
        	this.$el.find('textarea').val('')
        },

        success: function() {
          log('Published succcessfully')
          this.enableButton()
          this.clearContent()
        },

        publishError: function(error) {
          log('Publish error', error)
          this.enableButton()
          this.trigger('publish:error', error)
        }

    })

})
