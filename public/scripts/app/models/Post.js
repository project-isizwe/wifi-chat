define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , _        = require('underscore')
      , log      = require('app/utils/bows.min')('Models:Post')
      , socket   = require('app/utils/socket')

    return Backbone.Model.extend({
      
      xmppEvents: {
        'get': 'xmpp.buddycloud.retrieve',
        'post': 'xmpp.buddycloud.publish'
      },

      defaults: {
        content: null,
        author: {},
        published: null,
        commentCount: 0
      },
      
      initialize: function(post) {
        if (!post.entry) {
          /* We probably want the model to 
           * load this for us
           */
          return this.set(post, { silent: true })
        }
        var data = this._mapPost(post)
        this.set(data, { silent: true })
        this.requestCommentCount()
      },

      requestCommentCount: function() {
        var self = this
        var options = {
          node: this.get('node'),
          id: this.get('id'),
          rsm: { max: 1 }
        }

        socket.send('xmpp.buddycloud.items.replies', options, function(error, data, rsm) {
          if (error) {
            return self.trigger('error', error)
          }
          self.set({ commentCount: rsm.count || 0 })
        })
      },

      sync: function(method, collection, options) {
        if (!method) {
          method = 'get'
        }
        
        switch (method) {
          case 'get':
            return this.getPost()
          case 'post':
          case 'create':
            return this.publish()
          default:
            throw new Error('Unhandled method: ' + method)
        }
            
      },

      getPost: function() {
        var event = this.xmppEvents['get']
        var self = this
        var options = {
          node: this.get('node'),
          id: this.get('id')
        }
        socket.send(event, options, function(error, post) {
          if (error) {
            return self.trigger('error', error)
          }
          self.set(self._mapPost(post[0]), { silent: true })
          self.trigger('loaded:post')
        })
      },

      publish: function() {
        var payload = {
            node: this.get('node'),
            content: {
              atom: {
                content: this.get('content')
            },
            'in-reply-to': { ref: this.get('inReplyTo') }
          }
        }
        var self = this
        var event = this.xmppEvents['post']
        socket.send(event, payload, function(error, success) {
          if (error) {
            return self.trigger('publish:error', error)
          }
          self.trigger('publish:success')
        })
      },

      _mapPost: function(post) {
        return {
          displayName: null,
          username: post.entry.atom.author.uri.substr(5),
          published: Date.parse(post.entry.atom.published),
          content: this.parseContent(post.entry.atom.content.content),
          node: post.node,
          channelJid: post.node.split('/')[2],
          id: post.entry.atom.id,
          localId: post.entry.atom.id.split(',')[2] || post.entry.atom.id,
          canComment: true,
          isReply: ('comment' === post.entry.activity),
          inReplyTo: (post.entry['in-reply-to'] || {}).ref,
          likes: 1,
          commentCount: null
        }
      },

      parseContent: function(content) {
        return _.escape(content)
          .replace(/\{/g, '&#123;')
          .replace(/&#x2F;/g, '/')
          .replace(/\}/g, '&#125;')
      },

      addComment: function() {
        this.set('commentCount', this.attributes.commentCount + 1)
      },

      removeComment: function() {
        this.set(
          'commentCount',
          (this.attributes.commentCount > 0) ? this.attributes.commentCount - 1 : 0
        )
      }
      
    })

})
