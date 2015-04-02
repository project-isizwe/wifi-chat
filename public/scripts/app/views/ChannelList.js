define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , socket              = require('app/utils/socket')
      , Channels            = require('app/collections/Channels')
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
          this.options = options
          this.router = options.router
          this.collection = new Channels()
          this.collection.on('add', this.renderChannels, this)
          this.collection.on('reset', this.renderChannels, this)
          this.collection.on('remove', this.renderChannels, this)
          this.collection.on('all', function(event){ log('ChannelList', event) })

          var self = this
          var event = 'xmpp.buddycloud.subscriptions'
          socket.send(event, {}, function(error, data) {
            if (error) {
              return self.showError('Could not load channels')
            }
            // filter channels by nodes containing @topic and /posts.
            // and add them to the collection
            self.collection.add(data.filter(function(channel){
              return /@topics\..*\/posts$/.exec(channel.node)
            }))
          })
        },

        renderChannels: function() {
          var channelList = document.createDocumentFragment()

          this.collection.forEach(function(item){
            var channel = new ChannelListItemView({
              model: item
            })

            channelList.appendChild(channel.render().el)
          })
          log('rendering', channelList)

          this.$el.find('.channelList').replaceWith(channelList)
        },
    })

})
