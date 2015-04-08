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
    
    getComments: function() {
      if (0 !== this.models.length) {
        /* No reload */
        return
      }
      var self = this
      var options = {
        node: this.options.node,
        id: this.options.id,
        rsm: {
          max: 10
        }
      }
      if (this.options.afterItemId) {
        options.rsm.afterItemId = this.options.afterItemId
      }
      socket.send(this.event, options, function(error, data, rsm) {
        if (error) {
          return self.trigger('error', error)
        }
        self.add(data)
        self.trigger('loaded:comments')
      })
    }
    
  })
    
})