define(function(require) {

    'use strict';

    var _           = require('underscore')
      , Backbone    = require('backbone')
      , hasTermsTpl = require('text!tpl/Discovery.html')
      , noTermsTpl  = require('text!tpl/TermsAndConditions.html')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Discovery')

    return Backbone.View.extend({

        initialize: function () {
          this.performDiscovery()
          this.render()
        },
      
        performDiscovery: function() {
          socket.send('xmpp.buddycloud.discovery', function(error, server) {
            if (error) {
              alert('ERROR', error)
            }
            router.showFeed()
          })
        },

        render: function () {
            var template = (!localStorage.getItem('terms')) ?
              _.template(noTermsTpl) : _.template(hasTermsTpl)
            this.$el.html(template())
            return this
        },

    })

})
