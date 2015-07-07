define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Channel  = require('app/models/Channel')
    , log      = require('bows.min')('Collections:Channels')
    , socket   = require('app/utils/socket')
    
  return Backbone.Collection.extend({
    
    model: Channel,
    
    event: 'xmpp.buddycloud.subscriptions',
    
    sync: function(method, collection, options) {
      if (!method) {
        method = 'get'
      }
      
      switch (method) {
        case 'get':
          return this.getSubscriptions()
        default:
          throw new Error('Unhandled method')
      }
          
    },
    
    getSubscriptions: function() {
      if (0 !== this.models.length) {
        /* No reload */
        return
      }
      var self = this
      socket.send(this.event, {}, function(error, data) {
        if (error) {
          return self.trigger('error', error)
        }
        self.add(data.filter(function(channel) {
          return /@topics\..*\/posts$/.exec(channel.node)
        }))
      })
    }
    
  })
    
})