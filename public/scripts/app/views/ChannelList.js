define(function(require) {

    'use strict';

    var _        = require('underscore')
      , Backbone = require('backbone')
      , tpl      = require('text!tpl/ChannelList.html')
      , socket   = require('app/utils/socket')
      , log     = require('app/utils/bows.min')('Views:ChannelList')

    return Backbone.View.extend({
      
        requiresLogin: true,
      
        events: {},

        className: 'channels screen',
      
        initialize: function (options) {
          log('ChannelList')
          this.router = options.router
        },
      
        performDiscovery: function() {
          log('Performing discovery')
          var self = this
          socket.send('xmpp.buddycloud.discover', function(error, server) {
            log('Discovery response', error, server)
            if (error) {
              return alert('ERROR', error)
            }
            self.discovered = true
            self.complete()
          })
        },
      
        setTerms: function() {
          this.termsSigned = false
          if ($(this.el).find('.js-terms').is(':checked')) {
            this.termsSigned = true
          }
          this.complete()
        },
      
        complete: function() {
          if (this.discovered && this.termsSigned) {
            this.options.router.showFeed()
          }
        },          

        render: function() {
            this.$el.html(this.template())
            return this
        },

    })

})
