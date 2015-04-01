define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , socket         = require('app/utils/socket')
      , log            = require('app/utils/bows.min')('Views:ChannelList')
      , NoChannelsView = require('app/views/Channels/NoChannels')

    return Base.extend({

        template: _.template(require('text!tpl/ChannelList.html')),
      
        requiresLogin: true,
      
        className: 'channels screen',
      
        initialize: function(options) {
          this.options = options
          this.router = options.router
          var self = this
          var event = 'xmpp.buddycloud.subscriptions'
          socket.send(event, {}, function(error, data) {
             console.log(error, data)
             //if (error) {
            /* self.showError(new Error({
               type: 'error',
               showClose: true,
               message: 'Could not load channels'
             }))*/
              return self.showNoChannels()
             //}
          })
        },
      
        showNoChannels: function() {
          this.readyToRender = true
          var noChannelView = new NoChannelsView(this.options)
          this.render()
          this.showSubView('nochannels', noChannelView)
        },
                      
        render: function() {
            
          
        }
      
      
    })

})
