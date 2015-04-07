define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Channel  = require('app/models/Channel')
    , Post     = require('app/models/Post')
    , log      = require('app/utils/bows.min')('Collections:Topics')
    , socket   = require('app/utils/socket')
    
  return Backbone.Collection.extend({
    
    model: Post,
    
    event: 'xmpp.buddycloud.retrieve',
    
    initialize: function(models, options) {
      this.options = options
      this.options.node = '/user/' + options.channelJid + '/posts'
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
    
    getThreads: function() {
      if (0 !== this.models.length) {
        /* No reload */
        return
      }
      var self = this
      var options = {
        node: this.options.node,
        parentOnly: true,
        rsm: {
          max: 10
        }
      }
      socket.send(this.event, options, function(error, data) {
        if (error) {
          return self.trigger('error', error)
        }
        log('Received topics', data.length)
        self.add(data)
      })
    }
    
  })
    
})