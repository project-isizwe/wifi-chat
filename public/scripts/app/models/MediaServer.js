define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , log      = require('bows.min')('Models:MediaServer')
      , socket   = require('app/utils/socket')

    return Backbone.Model.extend({

      defaults: {
        domain: null,
        url: null,
        component: null
      },

      event: 'xmpp.buddycloud.discover.media-server',

	    initialize: function() {
	        this.performDiscovery(this.get('domain'))
	    },

	    performDiscovery: function(domain) {
	    	log(
          'Looking up media server for ' +
          this.get('domain')  +
          ' using ' +
          domain
        )
        var options = { of: domain }
        var self = this
        socket.send(this.event, options, function(error, data) {
          if (error) {
            /* Possibly perform a topics lookup fallback */
            if (('item-not-found' === error.condition) ||
              ('service-unavailable' === error.condition)) {
              return self.topicDomainCheck(domain)
            }
            self.trigger('discovery:error')
            return
          }
          log('Discovered media server for ' + self.get('domain'), data)
          self.set({
            component: data.component,
            url: data.endpoint
          })

        })
	    },

      topicDomainCheck: function(domain) {
        if (0 !== domain.indexOf('topics.')) {
          return this.trigger('discovery:error')
        }
        log('Performing topics domain fallback check')
        this.performDiscovery(domain.substr(7))
      }
    })

})
