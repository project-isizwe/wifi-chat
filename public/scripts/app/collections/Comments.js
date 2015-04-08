define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Post     = require('app/models/Post')
    , log      = require('app/utils/bows.min')('Collections:Comments')
    , socket   = require('app/utils/socket')
    
  return Backbone.Collection.extend({
    
    model: Post,
    
    event: 'xmpp.buddycloud.item.replies',
    
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
          max: 10,
          afterItemId: this.options.afterItemId || null
        }
      }
      socket.send(this.event, options, function(error, data) {
        if (error) {
          return self.trigger('error', error)
        }
        log('Received commentsf', data.length)
        self.add(data)
        self.trigger('loaded:comments')
      })
    }
    
  })
    
})