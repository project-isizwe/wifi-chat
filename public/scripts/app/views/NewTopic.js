define(function(require) {

    'use strict';

    var _             = require('underscore')
      , autosize      = require('autosize')
      , Base          = require('app/views/Base')
      , subscriptions = require('app/store/Subscriptions')
      , log           = require('app/utils/bows.min')('Views:NewTopic')
      , Avatar        = require('app/models/Avatar')
    require('jquery.scrollparent')

    return Base.extend({

      template: _.template(require('text!tpl/Empty.html')),
	    finalTemplate: _.template(require('text!tpl/NewTopic.html')),
	  
	    requiresLogin: true,

      className: 'newTopic screen',

      events: {
        'submit form': 'onSubmit',
        'click .js-backToChannel': 'goBack',
      },

	    initialize: function(options) {
        _.bindAll(this, 'saveDraft', 'scrollToBottom')

        this.options = options

        this.model = subscriptions
          .findWhere({ channelJid: options.channelJid })

        if (!this.model) {
          subscriptions.on('loaded:meta', function(model) {
            if (model.get('channelJid') === options.channelJid) {
              this.model = model
              this.renderFilled()
            }
          }, this)
        }
      },

      renderFilled: function() {
        log(this.model)
        this.$el.html(this.finalTemplate(_.extend(this.model.attributes, { 
          draft: this.getDraft()
        })))
        this.input = this.$('.js-input')
        this.input.on('input.newTopic', _.debounce(this.saveDraft, 200))

        autosize(this.input)
        this.input.get(0).addEventListener('autosize.resized', this.scrollToBottom)

        this.input.focus()

        /* 
          hack to move the cursor to end of text 
          https://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
        */
        if (this.input.get(0).selectionRange) {
          var len = this.input.val().length * 2;
          this.input.get(0).setSelectionRange(len, len);
        } else {
          this.input.val(this.input.val())
        }

        this.scrollToBottom()
      },

      onDestroy: function() {
        this.input.off('input.newTopic')
        this.triggerAutosizeEvent('autosize.destroy')
      },

      scrollToBottom: function() {
        this.$el.scrollParent().scrollTop(99999)
      },

      triggerAutosizeEvent: function(event) {
        var evt = document.createEvent('Event');
        evt.initEvent(event, true, false);
        this.input.get(0).dispatchEvent(evt);
      },

      getDraft: function() {
        return localStorage.getItem(this.getStorageKey())
      },

      saveDraft: function() {
        localStorage.setItem(this.getStorageKey(), this.input.val())
      },

      clearDraft: function() {
        localStorage.removeItem(this.getStorageKey())
      },

      getStorageKey: function() {
        return this.model.get('channelJid') + '-draft'
      },

      onSubmit: function() {
        // send this.input.val()
        // callback: this.onSuccessfullPost
      },

      onSuccessfullPost: function() {
        this.clearDraft()
      },

      goBack: function() {
        this.options.router.showChannel(this.model.get('jid'))
      },

    })

})
