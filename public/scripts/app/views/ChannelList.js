define(function(require) {

    'use strict';

    var _        = require('underscore')
      , Base     = require('app/views/Base')
      , socket   = require('app/utils/socket')
      , log     = require('app/utils/bows.min')('Views:ChannelList')

    return Base.extend({
      
        template: _.template(require('text!tpl/ChannelList.html')),
      
        requiresLogin: true,

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
        }
      
    })

})
