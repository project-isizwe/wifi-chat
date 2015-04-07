define(function(require) {

  'use strict';
  
  var Channels = require('app/collections/Channels')
    , Channel  = require('app/models/Channel')
    , log      = require('app/utils/bows.min')('Collections:Subscriptions')
    , socket   = require('app/utils/socket')
    
  return Backbone.Collection.extend({
    
    model: Channel,
    
    event: 'xmpp.buddycloud.subscriptions',
    affiliationsEvent: 'xmpp.buddycloud.affiliations',
    
    sync: function(method, collection, options) {
      if (!method) {
        method = 'get'
      }
      
      switch (method) {
        case 'read':
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
      this.getAffiliations()
    },
    
    getAffiliations: function() {
      var self = this
      socket.send(this.affiliationsEvent, {}, function(error, data) {
        if (error) {
          return self.trigger('error', error)
        }
        log('Retrieved affiliations', data)
        data.forEach(function(affiliation) {
          var channel = self.findWhere({ node: affiliation.node })
          if (!channel) {
            return
          }
          channel.set('affiliation', affiliation.affiliation)
        })
      })
    }
    
  })
    
})