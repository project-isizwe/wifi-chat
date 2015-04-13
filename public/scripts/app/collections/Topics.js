define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Post     = require('app/models/Post')
    , log      = require('bows.min')('Collections:Topics')
    , socket   = require('app/utils/socket')
    , pusher   = require('app/store/Pusher')
    
  return Backbone.Collection.extend({
    
    model: Post,

    lastTopicId: null,
    topicsPerRequest: 5,
    topicCount: null,
    
    event: 'xmpp.buddycloud.retrieve',

    initialize: function(models, options) {
      this.options = options
      this.options.node = '/user/' + options.channelJid + '/posts'
      pusher.on('new-post', this.pushedItem, this)
      pusher.on('delete-post', this.retractItem, this)
    },
    
    sync: function(method, collection, options) {
      if (!method) {
        method = 'get'
      }
      
      switch (method) {
        case 'get':
          return this.getThreads()
        default:
          throw new Error('Unhandled method')
      }
          
    },

    allItemsLoaded: function() {
      return (this.topicCount != null && (this.models.length === this.topicCount))
    },
    
    getThreads: function() {
      var self = this
      var options = {
        node: this.options.node,
        parentOnly: true,
        rsm: {
          max: this.topicsPerRequest
        }
      }
      if (this.lastTopicId) {
        options.rsm.after = this.lastTopicId
        options.rsm.max = this.topicsPerRequest
      }
      socket.send(this.event, options, function(error, data, rsm) {
        if (error) {
          return self.trigger('error', error)
        }
        log('Received topics')
        self.topicCount = rsm.count
        self.add(data)
        if (0 !== data.length) {
          self.lastTopicId = rsm.last
        }
        self.trigger('loaded:topics', data.length)
      })
    },

    pushedItem: function(model) {
      if (model.get('node') !== this.options.node) {
        return
      }
      // If post is a new thread drop into the collection
      var inReplyTo = model.get('inReplyTo')

      if (!inReplyTo) {
        return this.add(model)
      }
      // If post is a reply, update the comment count
      var parentPost = this.findWhere({ localId: inReplyTo })
      if (parentPost) {
        parentPost.addComment()
      }
    },

    retractItem: function(data) {
      if (data.node !== this.options.node) {
        return
      }
      // If post is a new thread drop into the collection
      var model = this.findWhere({ node: data.node, localId: data.id })
      if (model) {
        this.remove(model)
      }
    }
    
  })
    
})