define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Post     = require('app/models/Post')
    , log      = require('app/utils/bows.min')('Collections:Comments')
    , socket   = require('app/utils/socket')
    
  return Backbone.Collection.extend({
    
    model: Post,
    
    event: 'xmpp.buddycloud.items.replies',
    
    initialize: function(models, options) {
      this.options = options
    },

    comparator: function(model) {
      return model.get('published')
    },

    lastPostId: null,
    itemsPerRequest: 15,
    itemCount: null,
    
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
      return (this.itemCount && (this.models.length === this.itemCount))
    },
    
    getComments: function() {
      var self = this
      var options = {
        node: this.options.node,
        id: this.options.id,
        rsm: {
          max: this.itemsPerRequest
        }
      }
      if (this.lastPostId) {
        options.rsm.before = this.lastPostId
        options.rsm.max = this.itemsPerRequest + 1
      }
      socket.send(this.event, options, function(error, data, rsm) {
        if (error) {
          return self.trigger('error', error)
        }
        self.itemCount = rsm.count
        self.add(data)
        if (0 !== data.length) {
          self.lastPostId = rsm.first
        }
        self.trigger('loaded:comments')
      })
    }
    
  })
    
})