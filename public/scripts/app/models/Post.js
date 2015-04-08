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
          node: post.entry.node,
          id: post.entry.id,
          canComment: true,
          isReply: ('comment' === post.entry.activity),
          likes: 1,
          comments: 99
        }
        this.set(data)
      }
      
    })

})
