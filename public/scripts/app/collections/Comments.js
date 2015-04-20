define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Post     = require('app/models/Post')
    , log      = require('bows.min')('Collections:Comments')
    , socket   = require('app/utils/socket')
    , pusher   = require('app/store/Pusher')
    
  return Backbone.Collection.extend({
    
    model: Post,

    lastPostId: null,
    itemsPerRequest: 30,
    itemCount: null,

    comparator: false,
    
    event: 'xmpp.buddycloud.items.replies',
    
    initialize: function(models, options) {
      this.options = options
      pusher.on('new-post', this.pushedItem, this)
      pusher.on('delete-post', this.retractItem, this)
    },

    sync: function(method, collection, options) {
      if (!method) {
        method = 'get'
      }
      switch (method) {
        case 'get':
          return this.getComments()
        default:
          throw new Error('Unhandled method')
      }
          
    },

    allItemsLoaded: function() {
      return (this.itemCount != null && (this.models.length === this.itemCount))
    },
    
    getComments: function() {
      var self = this
      var options = {
        node: this.options.node,
        id: this.options.localId,
        rsm: {
          max: this.itemsPerRequest
        }
      }
      if (this.lastPostId) {
        options.rsm.before = this.lastPostId
        options.rsm.max = this.itemsPerRequest
      }
      socket.send(this.event, options, function(error, data, rsm) {
        if (error) {
          return self.trigger('error', error)
        }
        self.itemCount = rsm.count
        self.add(data, { silent: true })
        if (0 !== data.length) {
          self.lastPostId = rsm.first
        }
        self.trigger('loaded:comments', data.length)
      })
    },

    pushedItem: function(model) {
      if ((model.get('node') !== this.options.node) ||
        (model.get('inReplyTo') !== this.options.localId)) {
        return
      }
      this.add(model)
    },

    retractItem: function(details) {
      var post = this.findWhere({ node: details.node, localId: details.localId })
      if (post) {
        this.remove(post)
      }
    }
    
  })
    
})