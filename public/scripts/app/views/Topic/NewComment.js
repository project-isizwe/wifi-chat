define(function(require) {

    'use strict';

    var _        = require('underscore')
      , autosize = require('autosize')
      , Base     = require('app/views/Base')
      , Post     = require('app/models/Post')
      , log      = require('bows.min')('Views:Topic:NewComment')
      require('jquery.scrollparent')

    return Base.extend({

    	tagName: 'form',

        template: _.template(require('text!tpl/Topic/NewComment.html')),
      
        requiresLogin: true,

        events: {
        	'submit': 'createPost',
          'keypress .js-input': 'detectShiftEnter',
        },

        className: 'newComment',

        initialize: function(options) {
          _.bindAll(this, 'scrollToBottom')
          this.options = options
          this.once('loaded:comments', this.onCommentsLoaded, this)
        },

        afterRender: function() {
          this.input = this.$el.find('.js-input')
        },

        onDestroy: function() {
          this.triggerAutosizeEvent('autosize.destroy')
        },

        onCommentsLoaded: function() {
          autosize(this.input)
          this.input.get(0).addEventListener('autosize.resized', this.scrollToBottom)

          if(this.options.goToNewComment){
            this.input.focus()
            this.scrollToBottom()
          }
        },

        scrollToBottom: function() {
          this.$el.scrollParent().scrollTop(99999)
        },

        detectShiftEnter: function(event) {
          if(event.keyCode == 13 && event.shiftKey){
            event.preventDefault()
            this.createPost(event)
            return false
          }
        },

        createPost: function(event) {
          event.preventDefault()
          event.stopPropagation()
          var content = this.input.val()
          if (!content) return
          this.$el.find('.js-comment').attr('disabled', 'disabled')

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
        	this.$el.find('.js-comment').attr('disabled', false)
        },

        clearContent: function() {
        	this.input.val('')
          this.triggerAutosizeEvent('autosize.update')
        },

        triggerAutosizeEvent: function(event) {
          var evt = document.createEvent('Event');
          evt.initEvent(event, true, false);
          this.input.get(0).dispatchEvent(evt);
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
