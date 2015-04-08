define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , _        = require('underscore')
      , log      = require('app/utils/bows.min')('Models:Post')
      , socket   = require('app/utils/socket')

    return Backbone.Model.extend({
      
      defaults: {
        content: null,
        author: {},
        published: null,
        comments: 0
      },
      
      initialize: function(post) {
        var data = {
          displayName: null,
          username: post.entry.atom.author.uri.substr(5),
          published: post.entry.atom.published,
          content: post.entry.atom.content.content,
          node: post.node,
          channelJid: post.node.split('/')[2],
          id: post.entry.atom.id,
          canComment: true,
          isReply: ('comment' === post.entry.activity),
          commentCount: 0
        }
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
      }
      
    })

})
