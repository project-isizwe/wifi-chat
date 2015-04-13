define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Post     = require('app/models/Post')
    , log      = require('bows.min')('Collections:Comments')
    , socket   = require('app/utils/socket')
    , pusher   = require('app/store/Pusher')
    
  return Backbone.Collection.extend({
    
    model: Post,
    idAttribute: 'id',

    lastPostId: null,
    itemsPerRequest: 20,
    itemCount: null,
    
    event: 'xmpp.buddycloud.items.replies',
    
    initialize: function(models, options) {
      this.options = options
      pusher.on('new-post', this.pushedItem, this)
      pusher.on('delete-post', this.retractItem, this)
    },

    comparator: function(model) {
      return model.get('published')
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
        id: this.options.id,
        rsm: {
          max: this.itemsPerRequest
        }
      }
      if (this.lastPostId) {
        options.rsm.before = this.lastPostId
      } else if (this.options.after) {
        log('Loading posts after ' + this.options.after)
        options.rsm.after = this.options.after
        delete this.options.after
      }
      socket.send(this.event, options, function(error, data, rsm) {
        if (error) {
          return self.trigger('error', error)
        }
        self.itemCount = rsm.count
        self.add(data, { silent: true })
        if (0 !== data.length) {
          if (options.rsm.after) {
            self.lastPostId = rsm.first
          } else if (options.rsm.before) {
            self.firstPostId = rsm.last
          }
        }
        self.trigger('loaded:comments', data.length)
      })
    },

    pushedItem: function(model) {
      if ((model.get('node') !== this.options.node) ||
        (model.get('inReplyTo') !== this.options.id.split(',')[2])) {
        return
      }
      this.add(model)
    },

    retractItem: function(details) {
      var post = this.findWhere({ node: details.node, localId: details.id })
      if (post) {
        this.remove(post)
      }
    }
    
  })
    
})