define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , subscriptions       = require('app/store/Subscriptions')
      , ChannelListItemView = require('app/views/ChannelListItem')
      , log                 = require('app/utils/bows.min')('Views:ChannelList')

    return Base.extend({

        template: _.template(require('text!tpl/ChannelList.html')),
      
        requiresLogin: true,

        title: 'Channels',
      
        className: 'tab-views-item channelList',

        attributes: {
          'data-view': 'channelList'
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
