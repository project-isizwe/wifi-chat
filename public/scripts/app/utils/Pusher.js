define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , _        = require('underscore')
      , log      = require('bows.min')('Utils:Pusher')
      , socket   = require('app/utils/socket')
      , Post     = require('app/models/Post')

    var Pusher = function() {
      log('Pusher initialized')
      this.loadListeners()
    }

    Pusher.prototype = Backbone.Events

    Pusher.prototype.loadListeners = function() {
      var self = this
      socket.on('xmpp.buddycloud.push.item', function(item) { 
        log('Incoming post item', item)
        self.trigger('new-post', new Post(item))
      })
      socket.on('xmpp.buddycloud.push.retract', function(item) {
        log('Incoming post delete', item)
        self.trigger('delete-post', item)
      })
    }
    return Pusher

})
