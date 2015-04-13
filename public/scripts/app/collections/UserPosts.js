define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Post     = require('app/models/Post')
    , log      = require('bows.min')('Collections:UserPosts')
    , socket   = require('app/utils/socket')
    , pusher   = require('app/store/Pusher')
    
  return Backbone.Collection.extend({
    
    model: Post,

    postsPerRequest: 5,
    rsmPageNumber: 1,

    event: 'xmpp.buddycloud.search.do',

    initialize: function(models, options) {
      this.options = options
      pusher.on('new-post', this.pushedItem, this)
      log(models, options)
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
      return (this.topicCount && this.topicCount == 0 || (this.models.length === this.topicCount))
    },
    
    getPosts: function() {
      var options = {
        form: [{
          var: 'author',
          value: this.getOption('jid')
        }]
      }

      options.form.push({ var: 'page', value: this.rsmPageNumber })
      options.form.push({ var: 'rpp',  value: this.postsPerRequest })

      socket.send(this.event, options, function(error, data, rsm) {
        if (error) {
          return self.trigger('error', error)
        }

        self.add(data)
        ++self.rsmPageNumber
        self.trigger('loaded:user-posts', data.length)
      })
    },

    pushedItem: function(model) {
      log('Received push', model)
      if (model.get('author') !== this.options.router.getJid()) {
        return
      }
      
      this.add(model)
    }

  })
    
})