define(function(require) {

    'use strict';

    var $          = require('jquery')
      , Backbone   = require('backbone')
      , _          = require('underscore')
      , socket     = require('app/utils/socket')
      , Avatars    = require('app/store/Avatars')
      , channels   = require('app/store/Channels')
      , log        = require('bows.min')('Views:Topic:Report')

    return Backbone.View.extend({

      template: _.template(require('text!tpl/Topic/Report.html')),
      commentTemplate: _.template(require('text!tpl/Topic/CommentItem.html')),
      seeMoreTemplate: _.template(require('text!tpl/SeeMore.html')),

      className: 'modal',

      seeMoreCutoff: {
        height: 200,
        tolerance: 50
      },

      events: {
        'click .js-close': 'close',
        'click .js-report-send': 'sendReport'
      },

      initialize: function(options) {
        _.bindAll(this, 'onAttachedToDom') 

        this.model.bind('change', this.render, this)
        this.avatar = Avatars.getAvatar({ jid: this.model.get('authorJid') })
        this.avatar.on('change:url', this.renderAvatar, this)
      },
      
      render: function() {
        // double nesting to get the .html() including the <article>
        var comment = $('<div>').html($('<article class="post post--comment">').html(this.commentTemplate(_.extend(this.model.attributes, {
          showControls: false,
          avatarUrl: this.avatar.getUrl(),
          maxHeight: this.seeMoreCutoff.height + this.seeMoreCutoff.tolerance
        }))))

        this.$el.html(this.template(_.extend(this.model.attributes, {
          comment: comment.html()
        })))
        
        this.$el.find('time').timeago()

        this.loadDisplayName()

        return this
      },


      onAttachedToDom: function() {
        this.$el.find('.js-report-reason').focus()
        this.limitHeight()
      },

      loadDisplayName: function() {
        if (this.model.get('displayName')) {
          return
        }
        var authorNode = '/user/' + this.model.get('authorJid') + '/posts'
        channels.getChannel(authorNode, this, 'loadDisplayName')
      },

      renderAvatar: function() {
        this.$el.find('.avatar')
          .css('background-image', 'url("' + this.avatar.getUrl() + '")')      
      },

      limitHeight: function() {
        var target = this.$el.find('.js-limitHeight')

        if (target.height() !== this.seeMoreCutoff.height + this.seeMoreCutoff.tolerance) {
          return
        }

        target
          .css({
            height: this.seeMoreCutoff.height,
            maxHeight: ''
          })
          .append(this.seeMoreTemplate())
          .find('.js-seeMore').one('click', function(){
            target.css({
              height: ''
            })
            this.remove()
          })
      },

      close: function(event) {
        event.preventDefault()
        event.stopPropagation()
        this.trigger('close')
      },

      closeView: function() {
        this.stopListening()
        this.remove()
      },

      sendReport: function(event) {
        var self = this
        var data = {
          content: this.model.get('unparsedContent'),
          author: this.model.get('authorJid'),
          postId: this.model.get('id'),
          channel: this.model.get('channelJid'),
          reason: this.$el.find('.js-report-reason').val()
        }
        log('Sending report data', data)
        socket.send(
          'message.report',
          data,
          function() {
            self.close(event)
          })    
      }

    })

})
