define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , subscriptions       = require('app/store/Subscriptions')
      , ChannelListItemView = require('app/views/ChannelListItem')
      , log                 = require('bows.min')('Views:ChannelList')

    return Base.extend({

        template: _.template(require('text!tpl/ChannelList.html')),
      
        requiresLogin: true,

        title: 'Channels',
      
        className: 'tab-views-item chats',

        attributes: {
          'data-view': 'chats'
        },
      
        initialize: function(options) {
          var self = this

          this.options = options
          this.router = options.router
          this.collection = subscriptions
          this.collection.on('add', this.renderChannels, this)
          this.collection.on('reset', this.renderChannels, this)
          this.collection.on('remove', this.renderChannels, this)
          // this.collection.on('all', function(event) { log('ChannelList', event) })
          this.collection.on('error', function() {
            this.renderChannels()
            this.showError('Oh no! Could not load channels')
          }, this)

          // trigger channel load event when title changes
          this.collection.on('change:title', function() { self.trigger('loaded:channel') })

          if (0 !== this.collection.length) {
            this.once('render', this.renderChannels, this)
          }
          
          this.on('visibilitychange', this.onVisibilityChange, this)
        },

        onVisibilityChange: function(isVisible) {
          this.$el.toggleClass('is-visible', isVisible)
        },

        renderChannels: function() {
          var channelList = document.createDocumentFragment()
          var self = this

          this.collection.forEach(function(item) {
            var channel = new ChannelListItemView({
              model: item,
              router: self.router
            })
            channelList.appendChild(channel.render().el)
          })
          this.$el.find('.channelList').replaceWith(channelList)
        },
    })

})
