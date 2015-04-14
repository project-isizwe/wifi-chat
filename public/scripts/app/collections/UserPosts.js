define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Post     = require('app/models/Post')
    , log      = require('bows.min')('Collections:UserPosts')
    , socket   = require('app/utils/socket')
    , pusher   = require('app/store/Pusher')
    , user     = require('app/store/User')
    
  return Backbone.Collection.extend({
    
    model: Post,
    idAttribute: 'id',
    comparator: false,

    postsPerRequest: 5,
    rsmPageNumber: 1,

    allItemsAreLoaded: false,

    event: 'xmpp.buddycloud.search.do',

    initialize: function(models, options) {
      this.options = options
      pusher.on('new-post', this.pushedItem, this)
    },
    
    sync: function(method, collection, options) {
      if (!method) {
        method = 'get'
      }
      
      switch (method) {
        case 'get':
          return this.getPosts()
        default:
          throw new Error('Unhandled method')
      }
          
    },

    allItemsLoaded: function() {
      return this.allItemsAreLoaded
    },
    
    getPosts: function() {

      var options = {
        form: [{
          var: 'author',
          value: user.get('channelJid')
        }]
      }

      options.form.push({ var: 'page', value: this.rsmPageNumber })
      options.form.push({ var: 'rpp',  value: this.postsPerRequest })

      var self = this

      socket.send(this.event, options, function(error, data, rsm) {
        log('Received search results')
        if (error) {
          return self.trigger('error', error)
        }
        
        if (0 ===(data.results || []).length ) {
          self.allItemsAreLoaded = true
          self.trigger('completed:activities', data.results.length)
          return
        }
        self.add(data.results, { silent: true })
        ++self.rsmPageNumber

        self.trigger('loaded:activities', data.results.length)
      })
    },

    pushedItem: function(post) {
      if (post.get('username') !== user.get('jid')) {
        return
      }
      this.add(post)
    }

  })
    
})