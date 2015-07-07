define(function(require) {

  'use strict';
  
  var channels = require('app/store/Channels')
    , Channel  = require('app/models/Channel')
    , log      = require('bows.min')('Collections:Subscriptions')
    , socket   = require('app/utils/socket')
    
  return Backbone.Collection.extend({
    
    model: Channel,

    hasLoaded: false,
    
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

    isLoaded: function() {
      return this.hasLoaded
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
        log('Retrieved user affiliations')
        data.forEach(function(affiliation) {
          var channel = self.findWhere({ node: affiliation.node })
          if (!channel) {
            return
          }
          channel.set('affiliation', affiliation.affiliation)
          channels.add(channel)
        }, this)
        self.hasLoaded = true
        self.trigger('loaded:subscriptions')
      })
    }
    
  })
    
})