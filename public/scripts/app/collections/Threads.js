define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Channel  = require('app/models/Channel')
    , log      = require('app/utils/bows.min')('Collections:Threads')
    , socket   = require('app/utils/socket')
    
  return Backbone.Collection.extend({
    
    model: Thread,
    
    event: 'xmpp.buddycloud.retrieve',
    
    sync: function(method, collection, options) {
      log(method, collection, options)
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
    
    getThreads: function() {
      if (0 !== this.models.length) {
        /* No reload */
        return
      }
      var self = this
      var options = {
        node: this.options.node,
        rsm: {
          max: 10
        }
      }
      socket.send(this.event, options, function(error, data) {
        if (error) {
          return self.trigger('error', error)
        }
        self.add(data))
      })
    }
    
  })
    
})