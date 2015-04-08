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
        try {
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
            likes: 1,
            comments: 99
          }
          this.set(data, { silent: true })
        } catch (e) {
          log('error', e, post)
          log(e.stack)
          throw new Error(e)
        }
      }
      
    })

})
